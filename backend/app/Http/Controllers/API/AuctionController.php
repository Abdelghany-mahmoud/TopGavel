<?php

namespace App\Http\Controllers\API;

use App\Http\Controllers\Controller;
use App\Models\Auction;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;
use App\Http\Resources\AuctionResource;
use App\Models\Customer;
use App\Models\Image;
use Illuminate\Support\Facades\Auth;
use Carbon\Carbon;
use App\Models\User;
use App\Notifications\NewAuctionNotification;
use App\Notifications\UpdateAuctionNotification;
use Illuminate\Support\Facades\Notification;

class AuctionController extends Controller
{
  public function __construct()
  {
    $this->middleware('auth:sanctum')->only('store', 'update', 'destroy', 'pendingAuctions', 'approve', 'rejected','restore');
  }

  public function index(Request $request)
  {
    $perPage = $request->input('per_page', 10);

    $approvedAuctions = Auction::where('approval_status', 'approved')->paginate($perPage);

    return AuctionResource::collection($approvedAuctions)
      ->additional([
        'meta' => [
          'current_page' => $approvedAuctions->currentPage(),
          'last_page' => $approvedAuctions->lastPage(),
          'per_page' => $approvedAuctions->perPage(),
          'total' => $approvedAuctions->total(),
        ]
      ]);
  }

  /////////////////////////////////////////////////////////////////////////////////////////////////////////


  public function pendingAuctions(Request $request)
  {
    // Check if the authenticated user is an admin
    if (Auth::user()->role === 'admin') {
      $perPage = $request->input('per_page', 10);

      $pendingAuctions = Auction::where('approval_status', 'pending')->paginate($perPage);

      return AuctionResource::collection($pendingAuctions)
        ->additional([
          'meta' => [
            'current_page' => $pendingAuctions->currentPage(),
            'last_page' => $pendingAuctions->lastPage(),
            'per_page' => $pendingAuctions->perPage(),
            'total' => $pendingAuctions->total(),
          ]
        ]);
    }

    // If the user is not an admin, return a 403 Unauthorized response
    return response()->json([
      'message' => 'Unauthorized.'
    ], 403);
  }

  ////////////////////////////////////////////////////////////////////////////////////////////////////////////

  public function show(Auction $auction)
  {
    // $auction = Auction::findOrFail($auction->id)->where('approval_status', 'pending');
    return new AuctionResource($auction);
  }
  ////////////////////////////////////////////////////////////////////////////////////////////////////////////

  public function myAuctions(Request $request)
  {
    $customer = Customer::where('user_id', Auth::id())->first();
    $perPage = $request->input('per_page', 10);
    $auctions = Auction::where('customer_id', $customer->id)->paginate($perPage);
    return AuctionResource::collection($auctions)
      ->additional([
        'meta' => [
          'current_page' => $auctions->currentPage(),
          'last_page' => $auctions->lastPage(),
          'per_page' => $auctions->perPage(),
          'total' => $auctions->total(),
        ]
      ]);
  }
  /////////////////////////////////////////////////////////////////////////////////////////////////////////

  public function showActiveAuctions(Request $request)
  {
    $perPage = $request->input('per_page', 10);
    $currentTime = Carbon::now('UTC')->setTimezone('Africa/Cairo')->format('Y-m-d H:i:s');
    $activeAuctions = Auction::where('auction_start_time', '<=', $currentTime)
      ->where('auction_end_time', '>', $currentTime)
      ->where('approval_status', 'approved')
      ->paginate($perPage);

    // $auction = Auction::findOrFail(2);
    // return response()->json(['auction_start_time' => $auction->auction_start_time,'currentTime' => $currentTime], 404);

    return AuctionResource::collection($activeAuctions)
      ->additional([
        'meta' => [
          'current_page' => $activeAuctions->currentPage(),
          'last_page' => $activeAuctions->lastPage(),
          'per_page' => $activeAuctions->perPage(),
          'total' => $activeAuctions->total(),
        ]
      ]);
  }
  /////////////////////////////////////////////////////////////////////////////////////////////////////////
  public function finishedAuctions()
  {
    $currentTime = Carbon::now('UTC')->setTimezone('Africa/Cairo')->format('Y-m-d H:i:s');
    $finishedAuctions = Auction::with(['winningBidder.user', 'customer'])
      ->where('auction_end_time', '<', $currentTime)
      ->where('approval_status', 'approved')
      // ->whereNotNull('winning_bidder_id')
      ->get();
    // ->paginate(10);
    return AuctionResource::collection($finishedAuctions);
  }
  ////////////////////////////////////////////////////////////////////////////////////////////////////////
  public function store(Request $request)
  {
    // Prevent admin users from creating auctions
    if (Auth::user()->role === 'admin') {
      return response()->json([
        'message' => 'Admin cannot create an auction.'
      ], 403);
    }

    // Prevent unverified users from creating auctions
    if (Auth::user()->is_email_verified === 0) {
      return response()->json([
        'message' => 'Please verify your mail first.'
      ], 403);
    }

    if (Auth::user()->banned === 1) {
      return response()->json([
        'message' => "You can't create an auction,You are banned"
      ], 403);
    }


    // Validation for auction data and images
    $validation = Validator::make($request->all(), [
      'category_id' => ['required', 'exists:categories,id'],
      'item_name' => ['required', 'string', 'min:4', 'max:75'],
      'item_description' => ['required', 'string', 'min:15', 'max:255'],
      'starting_bid' => ['required', 'integer'],
      'bid_increment' => ['required', 'integer'],
      // 'auction_start_time' => ['required', 'date', 'after:now'],
      'auction_start_time' => ['required', 'date', function ($attribute, $value, $fail) {
        $startTime = \Carbon\Carbon::parse($value);
        $minStartTime = \Carbon\Carbon::now()->addDay();

        if ($startTime->lt($minStartTime)) {
          $fail('The auction start time must be at least 24 hours from now.');
        }
      }],
      // 'auction_end_time' => ['required', 'date'],
      'auction_end_time' => [
        'required',
        'date',
        function ($attribute, $value, $fail) use ($request) {
          $startTime = \Carbon\Carbon::parse($request->input('auction_start_time'));
          $endTime = \Carbon\Carbon::parse($value);

          if ($endTime->lt($startTime->addHour())) {
            $fail('The auction end time must be at least one hour after the auction start time.');
          }
        },
      ],
      'item_country' => ['required', 'string'],
      'item_media.*' => 'image|mimes:jpeg,png,jpg,gif|max:2048',
    ]);

    // Return validation errors if any
    if ($validation->fails()) {
      return response()->json($validation->messages(), 400);
    }

    // Retrieve customer linked to authenticated user
    $customer = Customer::where('user_id', Auth::id())->first();
    $data = $request->all();
    $data['customer_id'] = $customer->id;
    // $data.append('auction_actual_end_time', "aa"); // Adding a new key-value

    // $data['auction_actual_end_time'] = 20;


    // $auction = Auction::find(2);

    // Create the auction
    $auction = Auction::create($data);
    if ($request->hasFile('item_media')) {
      $files = $request->file('item_media');

      foreach ($files as $file) {
        $filename = time() . '_' . uniqid() . '.' . $file->getClientOriginalExtension();
        $file->move(public_path('uploads/images'), $filename);
        $data['item_media'][] = $filename;
        Image::create(['auction_id' => $auction->id, 'path' => $filename]);
      }
    }

    // Notify admins about the new auction
    $admins = User::where('role', 'admin')->get();
    if ($admins->isNotEmpty()) {
      Notification::send($admins, new NewAuctionNotification($auction));
    }

    return response()->json([
      'message' => 'Auction Created successfully',
      'auction' => new AuctionResource($auction)
    ], 200);
  }
  /////////////////////////////////////////////////////////////////////////////////////////////////////////
  public function update(Request $request, Auction $auction)
  {
    if (Auth::id() !== $auction->customer->user_id) {
      return response()->json(['message' => 'Unauthorized'], 403);
    }
    if (Auth::user()->banned === 1) {
      return response()->json([
        'message' => 'You can\'t edit auction,You are banned'
      ], 403);
    }
    $currentTime = Carbon::now('UTC')->setTimezone('Africa/Cairo')->format('Y-m-d H:i:s');

    if ($currentTime > $auction->auction_start_time) {
      return response()->json(['message' => 'You can\'t edit a running auction'], 403);
    }
    if ($currentTime < $auction->auction_start_time) {

      $data = $request->all();
      // return response()->json(['data'=>$data],400);
      $data['starting_bid']=intval($data['starting_bid']);
      $data['bid_increment']=intval($data['bid_increment']);

      // return response()->json(['data'=>$data],500);

    // Validation for auction data and images
    $validation = Validator::make($data, [
      'category_id' => ['required', 'exists:categories,id'],
      'item_name' => ['required', 'string', 'min:4', 'max:75'],
      'item_description' => ['required', 'string', 'min:15', 'max:255'],
      'starting_bid' => ['required', 'integer'],
      'bid_increment' => ['required', 'integer'],
      // 'auction_start_time' => ['required', 'date', 'after:now'],
      'auction_start_time' => ['required', 'date', function ($attribute, $value, $fail) {
        $startTime = \Carbon\Carbon::parse($value);
        $minStartTime = \Carbon\Carbon::now()->addDay();

        if ($startTime->lt($minStartTime)) {
          $fail('The auction start time must be at least 24 hours from now.');
        }
      }],
      // 'auction_end_time' => ['required', 'date'],
      'auction_end_time' => [
        'required',
        'date',
        function ($attribute, $value, $fail) use ($request) {
          $startTime = \Carbon\Carbon::parse($request->input('auction_start_time'));
          $endTime = \Carbon\Carbon::parse($value);

          if ($endTime->lt($startTime->addHour())) {
            $fail('The auction end time must be at least one hour after the auction start time.');
          }
        },
      ],
      'item_country' => ['required', 'string'],
      'item_media.*' => 'image|mimes:jpeg,png,jpg,gif|max:2048',
    ]);

    // Return validation errors if any
    if ($validation->fails()) {
      return response()->json($validation->messages(), 400);
    }

    // if ($request->hasFile('item_media')) {
    //   $files = $request->file('item_media');

    //   foreach ($files as $file) {
    //     $filename = time() . '_' . uniqid() . '.' . $file->getClientOriginalExtension();
    //     $file->move(public_path('uploads/images'), $filename);
    //     $data['item_media'][] = $filename;
    //     Image::create(['auction_id' => $auction->id, 'path' => $filename]);
    //   }
    // }

    if ($request->hasFile('item_media')) {
      $files = $request->file('item_media');
  
      // Delete old images
      $oldImages = Image::where('auction_id', $auction->id)->get();
      foreach ($oldImages as $oldImage) {
          $oldImagePath = public_path('uploads/images/' . $oldImage->path);
          if (file_exists($oldImagePath)) {
              unlink($oldImagePath); // Delete file from server
          }
          $oldImage->delete(); // Delete record from the database
      }
  
      // Upload new images
      foreach ($files as $file) {
          $filename = time() . '_' . uniqid() . '.' . $file->getClientOriginalExtension();
          $file->move(public_path('uploads/images'), $filename);
          $data['item_media'][] = $filename;
  
          // Insert new image paths into the database
          Image::create(['auction_id' => $auction->id, 'path' => $filename]);
      }
  }
  
      $auction->approval_status="pending";
      $auction->update($data);

      $admins = User::where('role', 'admin')->get();
      if ($admins->isNotEmpty()) {
        Notification::send($admins, new UpdateAuctionNotification($auction));
      }
      return response()->json([
        'message' => 'Auction updated successfully',
        'auction' => new AuctionResource($auction)
      ]);
    }
  }
  /////////////////////////////////////////////////////////////////////////////////////////////////////////
  public function getApprovedAuctions(Request $request)
  {
    $auctions = Auction::where('approval_status', 'approved')
      ->paginate($request->per_page);


    return AuctionResource::collection($auctions)
      ->additional([
        'meta' => [
          'current_page' => $auctions->currentPage(),
          'last_page' => $auctions->lastPage(),
          'per_page' => $auctions->perPage(),
          'total' => $auctions->total(),
        ]
      ]);

    // return response()->json([
    //   'data' => $auctions->items(),
    //   'meta' => [
    //     'current_page' => $auctions->currentPage(),
    //     'last_page' => $auctions->lastPage(),
    //     'total' => $auctions->total(),
    //   ],
    // ]);
  }

  public function destroy($id)
  {

    // $id=$request->input('auction_id');


    $auction = Auction::findOrFail($id);

    //  return response()->json([
    //   'message' => $auction
    // ], 200);
    if (Auth::user()->banned === 1) {
      return response()->json([
        'message' => 'You can\'t delete auction,You are banned'
      ], 403);
    }

    $user = Auth::user();
    $currentTime = Carbon::now('UTC')->setTimezone('Africa/Cairo')->format('Y-m-d H:i:s');
    // Check if the time is before auction start
    if ($currentTime < $auction->auction_start_time) {
      // Check if the user is either the owner of the auction or an admin
      if ($user->role === 'admin' || $user->id === $auction->customer->user_id) {
        $auction->delete();

        return response()->json([
          'message' => 'Auction deleted successfully'
        ], 200);
      }
    }

    return response()->json([
      'message' => 'Unauthorized.'
    ], 403);
  }

  public function restore($id)
  {
    $user = Auth::user();
    $auction = Auction::withTrashed()->find($id);
    if (!$auction || !$auction->trashed()) {
      return response()->json(['message' => 'Auction not found or not deleted'], 404);
    }
    $currentTime = Carbon::now('UTC')->setTimezone('Europe/Bucharest')->format('Y-m-d H:i:s');
    // Check if the time is before auction start
    if ($currentTime < $auction->auction_start_time) {
      if ($user->role === 'admin' || $user->id === $auction->customer->user_id) {
        $auction->restore();
        return response()->json(['message' => 'Auction restored successfully'], 200);
      }
    }
  }


  public function getDeletedAuctions(Request $request)
  {

    $perPage = $request->input('per_page', 10);


    $deletedAuctions = Auction::onlyTrashed()
      ->paginate($perPage); // Only soft-deleted records

    return AuctionResource::collection($deletedAuctions)
      ->additional([
        'meta' => [
          'current_page' => $deletedAuctions->currentPage(),
          'last_page' => $deletedAuctions->lastPage(),
          'per_page' => $deletedAuctions->perPage(),
          'total' => $deletedAuctions->total(),
        ]
      ]);

    // $user = Auth::user();

    // dd(Auth::user());

    // // Check if the authenticated user is an admin
    // if (Auth::user()->role  === 'admin') {
    //   $perPage = $request->input('per_page', 10);


    // $deletedAuctions = Auction::onlyTrashed()
    // ->paginate($perPage); // Only soft-deleted records

    // return AuctionResource::collection($deletedAuctions)
    // ->additional([
    //   'meta' => [
    //     'current_page' => $deletedAuctions->currentPage(),
    //     'last_page' => $deletedAuctions->lastPage(),
    //     'per_page' => $deletedAuctions->perPage(),
    //     'total' => $deletedAuctions->total(),
    //   ]
    // ]);

    // }

    // // If the user is not an admin, return a 403 Unauthorized response
    // return response()->json([
    //   'message' => 'Unauthorized.'
    // ], 403);

  }



  public function searchByCategory(Request $request)
  {
    $categoryId = $request->input('category_id');

    $validation = Validator::make($request->all(), [
      'category_id' => ['required', 'exists:categories,id'],
    ]);

    if ($validation->fails()) {
      return response()->json($validation->messages(), 400);
    }

    $perPage = $request->input('per_page', 10);

    $auctions = Auction::where('category_id', $categoryId)->paginate($perPage);

    return AuctionResource::collection($auctions)
      ->additional([
        'meta' => [
          'current_page' => $auctions->currentPage(),
          'last_page' => $auctions->lastPage(),
          'per_page' => $auctions->perPage(),
          'total' => $auctions->total(),
        ]
      ]);
  }
  public function search(Request $request)
  {
    $searchTerm = $request->input('search');

    $validation = Validator::make($request->all(), [
      'search' => ['required', 'string', 'min:1'],
    ]);

    if ($validation->fails()) {
      return response()->json($validation->messages(), 400);
    }

    $perPage = $request->input('per_page', 10);

    $auctions = Auction::where('item_name', 'LIKE', '%' . $searchTerm . '%')
      ->orWhere('item_description', 'LIKE', '%' . $searchTerm . '%')
      ->orWhere('item_country', 'LIKE', '%' . $searchTerm . '%')
      ->paginate($perPage);

    if ($auctions->isEmpty()) {
      return response()->json([
        'data' => [],
        'meta' => [
          'current_page' => 1,
          'last_page' => 1,
          'per_page' => $perPage,
          'total' => 0,
        ]
      ], 200);
    }

    return AuctionResource::collection($auctions)
      ->additional([
        'meta' => [
          'current_page' => $auctions->currentPage(),
          'last_page' => $auctions->lastPage(),
          'per_page' => $auctions->perPage(),
          'total' => $auctions->total(),
        ]
      ]);
  }

  public function approve($id)
  {
    // $user = Auth::user();
    // Check if the user is admin
    // if ($user->role === 'admin') {
    $auction = Auction::find($id);
    $auction->approval_status = 'approved';
    $auction->save();

    return response()->json([
      'message' => 'Auction approved successfully'
    ], 200);
    // }
    // return response()->json([
    //   'message' => 'Unauthorized.'
    // ], 403); 

  }
  public function rejected($id)
  {
    // $user = Auth::user();
    // Check if the user is admin
    // if ($user->role === 'admin') {
    $auction = Auction::find($id);
    $auction->approval_status = 'rejected';
    $auction->save();

    return response()->json([
      'message' => 'Auction rejected successfully'
    ], 200);
    // }
    // return response()->json([
    //   'message' => 'Unauthorized.'
    // ], 403); 

  }
}
