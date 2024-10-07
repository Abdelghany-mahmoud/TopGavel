<?php
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\API\UserController;
use App\Http\Controllers\API\AuctionController;
use App\Http\Controllers\API\BidController;
use App\Http\Controllers\API\CommentController;
use App\Http\Controllers\API\NotificationController;
use App\Http\Controllers\API\PaymentController;

Route::post('/register', [UserController::class, 'register'])->name('register');
Route::post('/email_verify', [UserController::class,'email_verify'])->name('email_verify');
Route::get('/login', [UserController::class, 'notLoggedIn'])->name('login');
Route::post('/login', [UserController::class, 'login'])->name('login');
Route::get('/logout', [UserController::class, 'logout'])->name('logout')->middleware('auth:sanctum');

Route::middleware('auth:sanctum')->group(function () {
    Route::get('/profile', [UserController::class, 'profile']);
    Route::put('/profile', [UserController::class, 'updateProfile']);
});

Route::apiResource('user', UserController::class);

// Auction Routes - specific first
Route::get('/auction/active-auctions', [AuctionController::class, 'showActiveAuctions']); 
Route::get('/auction/approved', [AuctionController::class, 'getApprovedAuctions']); 
Route::get('/auction/pending', [AuctionController::class, 'pendingAuctions']); 
Route::get('/auction/search', [AuctionController::class, 'search']); 
Route::get('/auction/search-by-category', [AuctionController::class, 'searchByCategory']); 

Route::post('/auction/approve/{id}', [AuctionController::class, 'approve']); 
Route::post('/auction/rejected/{id}', [AuctionController::class, 'rejected']);

// Then resource route
Route::apiResource('auction', AuctionController::class);

// Auction-Related Routes
Route::apiResource('{auction}/bids', BidController::class);
Route::apiResource('{auction}/comments', CommentController::class);

// Route::get('/checkout', [PaymentController::class, 'index'])->name('index');
// Route::post('/checkout/{auctionID}/{bidderID}', [PaymentController::class, 'checkout'])->name('checkout');
// Route::get('/success/{auctionID}/{bidderID}', [PaymentController::class, 'success'])->name('success');


Route::post('/create-checkout-session', [PaymentController::class, 'createCheckoutSession'])->name('createSession')->middleware('auth:sanctum');
Route::get('/success/{auctionID}/{bidderID}', [PaymentController::class, 'success'])->name('success');

Route::get('/cancel', function () {return 'Payment Cancelled';})->name('cancel');

Route::post('/check-payment', [PaymentController::class, 'checkPayment'])->middleware('auth:sanctum');
// Notifications and Payment Routes
Route::get('/notifications', [NotificationController::class, 'index'])->middleware('auth:sanctum');
Route::post('/checkout/{auctionID}', [PaymentController::class, 'checkout'])->name('checkout');
Route::get('/success/{auctionID}', [PaymentController::class, 'success'])->name('success');

