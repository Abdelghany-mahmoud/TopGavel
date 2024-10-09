<?php


namespace App\Http\Controllers\API;

use App\Http\Controllers\Controller;
use App\Models\Comment;
use App\Models\Auction;
use App\Models\User;

use Illuminate\Http\Request;
use App\Http\Resources\CommentResource;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Validator;
use App\Notifications\NewCommentNotification;
use Illuminate\Support\Facades\Notification;

class CommentController extends Controller
{
    public function __construct()
    {
        $this->middleware('auth:sanctum')->only('store', 'update', 'destroy');
    }
    ////////////////////////////////////////////////////////////////////////////////
    public function index($auctionid)
    {
        $auction = Auction::findOrFail($auctionid);
        $comments = $auction->comments()->get();
        return response()->json([
            'comments' => CommentResource::collection($comments)
        ], 200);
    }

    ///////////////////////////////////////////////////////////////////////////////////////////////////


    public function store(Request $request, $auctionid)
    {
        if (Auth::user()->is_email_verified === 0) {
            return response()->json([
                'message' => 'Please verify your mail first.'
            ], 403);
        }
        // Validate the comment input
        $validation = Validator::make($request->all(), [
            'comment_text' => 'required|string|min:3|max:255',
        ]);

        if ($validation->fails()) {
            return response()->json($validation->messages(), 400);
        }

        // Find the auction
        $auction = Auction::findOrFail($auctionid);

        // Create the comment for the auction
        $comment = $auction->comments()->create([
            'comment_text' => $request->comment_text,
            'auction_id' => $auctionid,
            'user_id' => Auth::id(),
        ]);


        // Send notification to all admin users

        $admins = User::where('role', 'admin')->get();

        // Send notification to all admin users
        if ($admins->isNotEmpty()) {
            Notification::send($admins, new NewCommentNotification($auction, $comment));
        }

        // Get the customer who owns the auction
        $customer = $auction->customer;

        // Check if customer exists and retrieve the related user (auction owner)
        if ($customer && $customer->user) {
            $owner = $customer->user;

            // Notify the owner about the new comment
            $owner->notify(new NewCommentNotification($auction, $comment));
        } else {
            // Handle the case where the customer or user is not found
            return response()->json(['error' => 'Auction owner not found'], 404);
        }

        // Return the created comment as a resource
        return response()->json([
            'comment' => new CommentResource($comment),
        ], 200);
    }

    ///////////////////////////////////////////////////////////////////////////////////////////////////

    public function update(Request $request, $auctionid, $commentId)
    {

        $validation = Validator::make($request->all(), [
            'comment_text' => 'required|string|min:3|max:255'
        ]);
        if ($validation->fails()) {
            return response()->json($validation->messages(), 400);
        }
        $comment = Comment::findOrFail($commentId);
        if ($comment->user_id != Auth::id()) {
            return response()->json(['message' => 'Unauthorized'], 401);
        }
        $comment->comment_text = $request->comment_text;
        $comment->save();
        return response()->json([
            'message' => 'Comment updated successfully',
            'comment' => new CommentResource($comment)
        ], 200);
    }

    ///////////////////////////////////////////////////////////////////////////////////////////////////

    public function destroy($auctionid, $commentId)
    {
        $comment = Comment::findOrFail($commentId);

        // Allow admin users to delete comments
        if (Auth::user()->role === 'admin' || $comment->user_id === Auth::id()) {
            $comment->delete();
            return response()->json(['message' => 'Comment deleted successfully'], 200);
        }

        return response()->json(['message' => 'Unauthorized'], 401);
    }
}
