<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\RoomController;
use App\Http\Controllers\HotelController;
use App\Http\Controllers\AuthController;
use App\Http\Controllers\BookingController;
use App\Http\Controllers\ContactController;

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
Route::get('/room_types', [RoomController::class, 'index']);
Route::get('/tbhotel', [HotelController::class, 'index']);

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