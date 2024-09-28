<?php

use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Route;

use App\Http\Controllers\API\PaymentController;


// Route::get('/', function () {
//     return view('welcome');
// });

// Auth::routes();

// Route::get('/home', [App\Http\Controllers\HomeController::class, 'index'])->name('home');



Route::get('/index', [PaymentController::class, 'index'])->name('index');
Route::post('/checkout/{auctionID}/{bidderID}', [PaymentController::class, 'checkout'])->name('checkout');
Route::get('/success/{auctionID}/{bidderID}', [PaymentController::class, 'success'])->name('success');
        
   