<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\API\UserController;
use App\Http\Controllers\API\AuctionController;
use App\Http\Controllers\API\BidController;
use App\Http\Controllers\API\CommentController;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Validation\ValidationException;
use App\Models\User;
use App\Http\Controllers\API\NotificationController;
use App\Http\Controllers\API\PaymentController;
use App\Http\Controllers\Auth\VerificationController;


Route::post('/register', [UserController::class, 'register'])->name('register');
route::get('/login', [UserController::class, 'notLoggedIn'])->name('login');
route::post('/login', [UserController::class, 'login'])->name('login');
route::get('/logout', [UserController::class, 'logout'])->name('logout')->middleware('auth:sanctum');

Route::apiResource('user', UserController::class);


Route::apiresource('auction', AuctionController::class);
Route::get('/active-auctions', [AuctionController::class, 'showActiveAuctions']);
Route::get('/auction-status', [AuctionController::class, 'updateAuctionStatus']);
Route::get('/auctions/search-by-category', [AuctionController::class, 'searchByCategory']);


Route::apiResource('{auction}/bids', BidController::class);
Route::apiResource('{auction}/comments', CommentController::class);

Route::middleware('auth:sanctum')->group(function () {
        Route::get('/notifications', [NotificationController::class, 'index']);
    });
    


    
Route::post('/email/verification-notification', [VerificationController::class, 'resend'])
        // ->middleware(['auth:api', 'throttle:6,1'])
        ->name('verification.send');
    

Route::middleware('auth:api')->group(function () {
Route::get('/email/verify/{id}/{hash}', [VerificationController::class, 'verify'])
                // ->middleware('signed')
                ->name('verification.verify');
        });




Route::get('/index', [PaymentController::class, 'index'])->name('index');
Route::post('/checkout/{auctionID}/{bidderID}', [PaymentController::class, 'checkout'])->name('checkout');
Route::get('/success/{auctionID}/{bidderID}', [PaymentController::class, 'success'])->name('success');
        
        
        