<?php

use Illuminate\Support\Facades\Route;
use Illuminate\Support\Facades\Mail;
use App\Http\Controllers\AuthController;
use App\Http\Controllers\PaymentController;

/*
|--------------------------------------------------------------------------
| Web Routes
|--------------------------------------------------------------------------
|
| Here is where you can register web routes for your application. These
| routes are loaded by the RouteServiceProvider and all of them will
| be assigned to the "web" middleware group. Make something great!
|
*/

Route::get('/{any}', function () {
    return view('app');
})->where('any', '.*');


Route::middleware('web')->group(function () {
    Route::post('/login', [AuthController::class, 'login']);
});

Route::get('/test-mail', function() {
    Mail::raw('Test email from Laravel', function($message) {
        $message->to('ntn24498@gmail.com')->subject('Test Email');
    });
    return 'Email đã được gửi!';
});

// Route::get('/payment/{payment_id}', [PaymentController::class, 'showPaymentPage'])->name('payment.show');
// Route::post('/payment/{payment_id}/process', [PaymentController::class, 'processPayment'])->name('payment.process');