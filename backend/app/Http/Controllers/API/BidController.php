<?php

namespace App\Http\Controllers\API;

use App\Http\Controllers\Controller;
use App\Http\Resources\AuctionResource;
use App\Models\Bid;
use App\Models\User;
use App\Models\Auction;
use Illuminate\Http\Request;
use App\Http\Resources\BidResource;
use App\Models\Customer;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Validator;
use App\Notifications\NewBidNotification;
use Illuminate\Support\Facades\Notification;
use Carbon\Carbon;

class BidController extends Controller
{
    public function __construct()
    {
        $this->middleware('auth:sanctum')->only('store', 'update', 'destroy');
    }

    public function index($auction)
    {
        $auction = Auction::findOrFail($auction);
        return BidResource::collection($auction->bids);
    }


    ///////////////////////////////////////////////////////////////////////////////////////////////////////////////

    public function store(Request $request, $auctionId)
    {
        if (Auth::user()->role === 'admin') {
            return response()->json([
                'message' => 'Admin cannot place a bid.'
            ], 403);
        }

        if (Auth::user()->is_email_verified == 0) {
            return response()->json([
                'message' => 'Please verify your mail first.'
            ], 403);
        }
        // Fetch the auction or throw a 404 error if not found
        $auction = Auction::findOrFail($auctionId);


        // Get the authenticated customer's ID
        $customer = Customer::where('user_id', Auth::id())->first();
        if (!$customer) {
            return response()->json(['error' => 'Customer not found.'], 404);
        }

        // Check if the authenticated user is the owner of the auction
        if ($auction->customer_id === $customer->id) {
            return response()->json([
                "message" => "You cannot bid on your own auction.",
            ], 400);
        }

        $currentTime = Carbon::now('UTC')->setTimezone('Europe/Bucharest')->format('Y-m-d H:i:s');
        if ($auction->auction_start_time > $currentTime) {
            return response()->json([
                "message" => "You can't participate in this auction. This auction didn't start yet.",
            ], 400);
        }

        if ($auction->auction_end_time < $currentTime) {
            return response()->json([
                "message" => "You can't participate in this auction. This auction has ended.",
            ], 400);
        }

        if ($auction->approval_status !=='approved') {
            return response()->json([
                "message" => "This auction is not approved yet.",
            ], 400);
        }
     


        // Get the last bid on the auction, if available
        $lastBid = Bid::where('auction_id', $auction->id)->latest('created_at')->first();

        // Prevent the last bidder from bidding again
        if ($lastBid && $lastBid->customer_id === $customer->id) {
            return response()->json([
                "message" => "You cannot place consecutive bids. Another bidder must bid before you can place another.",
            ], 400);
        }

        // Get the starting bid and bid increment details
        $startingBid = $auction->starting_bid;
        $bidIncrement = $auction->bid_increment;

        // Determine the minimum bid amount required
        $currentMaxBid = Bid::where('auction_id', $auction->id)->max('bid_amount') ?? null;
        $minBidAmount = $currentMaxBid ? $currentMaxBid + $bidIncrement : $startingBid;

        // Validate the bid amount to ensure it's at least the minimum required
        $validation = Validator::make($request->all(), [
            'bid_amount' => [
                'required',
                'numeric',
                function ($attribute, $value, $fail) use ($minBidAmount) {
                    if ($minBidAmount > $value) {
                        $fail("The bid amount must be at least $minBidAmount.");
                    }
                },
            ],
        ]);

        // Return validation error messages if the validation fails
        if ($validation->fails()) {
            return response()->json($validation->messages(), 400);
        }


        // check if the customer is bidding for the first time or not for the Insurance payment 
        // $isFound = Bid::where('auction_id', $auction->id)
        //     ->where('customer_id', $customer->id)
        //     ->exists();

        // if (!$isFound) {
        //     // return route('checkout', ['auctionID' => $auction->id]);
        //     return response()->json([
        //         'payment'=>false,
        //         'message' => 'You have to pay insurance',
        //     ], 400);
        // }


        // Create the new bid
        $data = $request->all();
        $data['customer_id'] = $customer->id;
        $data['auction_id'] = $auction->id;
        $bid = Bid::create($data);

            // Extend the auction end time by 2 minutes if placed in last 2 minutes of auction
  
        $auctionEndTime = Carbon::parse($auction->auction_end_time);

        $bidCreatedAt = Carbon::parse($bid->created_at);
        
        // Check if the bid is placed within the last 2 minutes of the auction
        $twoMinutesBeforeEnd = $auctionEndTime->copy()->subMinutes(2);
        if ($bidCreatedAt > $twoMinutesBeforeEnd) {
            // Extend the auction end time by another 2 minutes
            $auction->auction_end_time = $auctionEndTime->addMinutes(2)->toDateTimeString();
            $auction->save();
        }
     
        $winningBid = Bid::where('auction_id', $auction->id)->latest('created_at')->first();
            if ($winningBid) {
                $auction->winning_bidder_id = $winningBid->customer_id;
                $auction->save();
                    }
                
        

        $admins = User::where('role', 'admin')->get();

        // Send notification to all admin users
        if ($admins->isNotEmpty()) {
            Notification::send($admins, new NewBidNotification($auction, $bid));
        }

        // Notify all previous bidders about the new bid
        $previousBidders = Bid::where('auction_id', $auction->id)
            ->where('customer_id', '!=', $customer->id) // Exclude the current bidder
            ->with('customer.user') // Ensure the customer relationship is loaded with user
            ->get()
            ->pluck('customer.user');

        if ($previousBidders->isNotEmpty()) {
            Notification::send($previousBidders, new NewBidNotification($auction, $bid));
        }

        // Notify the auction owner if they exist
        $owner = $auction->customer->user ?? null; // Get the auction owner's user
        if ($owner) {
            $owner->notify(new NewBidNotification($auction, $bid));
        } else {
            return response()->json(['error' => 'Auction owner not found.'], 404);
        }

        // Return success response
        return response()->json([
            'message' => 'Your bid has been added successfully.',
            'auction' => new AuctionResource($auction),
        ], 200);
    }
    ///////////////////////////////////////////////////////////////////////////////////////////

    public function destroy($bidId)
    {
        // Fetch the bid or throw a 404 error if not found
        $bid = Bid::findOrFail($bidId);

        // Get the authenticated customer
        $customer = Customer::where('user_id', Auth::id())->first();

        if (!$customer) {
            return response()->json(['error' => 'Customer not found.'], 404);
        }

        // Check if the customer is the owner of the bid
        if ($bid->customer_id !== $customer->id) {
            return response()->json([
                'message' => 'You are not authorized to delete this bid.',
            ], 403);
        }

        // Delete the bid
        $bid->delete();

        // Return success response
        return response()->json([
            'message' => 'Bid deleted successfully.',
        ], 200);
    }
}
