<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\RoomController;
use App\Http\Controllers\HotelController;
use App\Http\Controllers\AuthController;
use App\Http\Controllers\BookingController;
use App\Http\Controllers\ContactController;
use App\Http\Controllers\FollowEmailController;
use App\Http\Controllers\UserController;
use App\Http\Controllers\SpecialOfferController;
use App\Http\Controllers\OfferController;



/*
|--------------------------------------------------------------------------
| API Routes
|--------------------------------------------------------------------------
|
| Here is where you can register API routes for your application. These
| routes are loaded by the RouteServiceProvider and all of them will
| be assigned to the "api" middleware group. Make something great!
|
*/

Route::middleware('auth:sanctum')->get('/user', function (Request $request) {
    return $request->user();
});

//Room Type
Route::get('/room_types', [RoomController::class, 'index']);
Route::get('/room-types', [RoomController::class, 'show']);
Route::put('/room_types/{id}', [RoomController::class, 'update']);
Route::apiResource('room_types', RoomController::class)->except(['update']);

// dangerous
Route::get('/google/login', [AuthController::class, 'redirectToGoogle'])->name('google.login');
Route::get('/auth/google/callback', [AuthController::class, 'handleGoogleCallback'])->name('google.callback');
// dangerous

Route::apiResource('users', AuthController::class);
Route::get('/users/{id}/bookings', [BookingController::class, 'getUserBookings']);
Route::post('/users/{id}/change-password', [AuthController::class, 'changePassword']);
Route::delete('/bookings/{id}', [BookingController::class, 'destroy']);

Route::post('/register', [AuthController::class, 'register']);
Route::post('/login', [AuthController::class, 'login']);
Route::post('/ForgotPassword', [AuthController::class, 'ForgotPassword']);
Route::post('/booking', [BookingController::class, 'booking']);

Route::post('/contact', [App\Http\Controllers\ContactController::class, 'send']);

Route::post('/follow-email', [FollowEmailController::class, 'store']);

// fix infor rooms of admin



Route::get('/users_manager', [UserController::class, 'index']);

Route::delete('/users_manager/{id}', [UserController::class, 'destroy']);

Route::get('/special-offers', [SpecialOfferController::class, 'index']);
Route::put('/special-offers/{id}', [SpecialOfferController::class, 'update']);
Route::post('/send-offers', [OfferController::class, 'sendOffers']);
