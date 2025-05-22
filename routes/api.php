<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use Illuminate\Support\Facades\Auth;
use App\Http\Controllers\RoomController;
use App\Http\Controllers\HotelController;
use App\Http\Controllers\AuthController;
use App\Http\Controllers\BookingController;
use App\Http\Controllers\ContactController;
use App\Http\Controllers\FollowEmailController;
use App\Http\Controllers\UserController;
use App\Http\Controllers\SpecialOfferController;
use App\Http\Controllers\OfferController;
use App\Http\Controllers\RoomInfoController;
use App\Http\Controllers\StaffRoomManagementController;
use App\Http\Controllers\BookingManagerController;
use App\Http\Controllers\ReviewController;
use App\Http\Middleware\RememberTokenAuth;
use App\Http\Controllers\ComplaintsController;

use App\Http\Controllers\PaymentController;



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

Route::get('/users/{id}/bookings', [BookingController::class, 'getUserBookings']);
Route::put('/users/{id}', [AuthController::class, 'update']);
Route::post('/users/{id}/change-password', [AuthController::class, 'changePassword']);
Route::delete('/bookings/{id}', [BookingController::class, 'destroy']);
Route::get('/reviews/{id}', [ReviewController::class, 'getReviewsByUserID']);
Route::get('/complaints/{id}', [ComplaintsController::class, 'getComplaintsByUserID']);

Route::post('/register', [AuthController::class, 'register']);
Route::post('/login', [AuthController::class, 'login']);
Route::post('/ForgotPassword', [AuthController::class, 'ForgotPassword']);
Route::post('/booking', [BookingController::class, 'booking']);
Route::get('/available_rooms', [BookingController::class, 'checkAvailableRooms']);
Route::post('/contact', [App\Http\Controllers\ContactController::class, 'send']);

Route::post('/follow-email', [FollowEmailController::class, 'store']);

// route của staff
    Route::get('/dataUser', [UserController::class, 'dataUser']);
    Route::get('/bookingList', [BookingController::class, 'BookingList']);
    Route::post('/Staff_booking', [BookingController::class, 'booking_by_staff']);
    // Route Rooms Management
    Route::get('/rooms', [StaffRoomManagementController::class, 'index']);
    Route::get('/rooms/{id}', [StaffRoomManagementController::class, 'show']);
    Route::put('/rooms/{id}', [StaffRoomManagementController::class, 'update']);
    Route::delete('/rooms/{id}', [StaffRoomManagementController::class, 'destroy']);
    Route::post('/rooms', [StaffRoomManagementController::class, 'store']);
//=----------------------------------------------


// fix infor rooms of admin

Route::get('/users_manager', [UserController::class, 'index']);
Route::get('/staff_manager', [UserController::class, 'show_staff']);
Route::put('/staff_manager/{id}', [UserController::class, 'update']);
Route::post('/staff_manager', [UserController::class, 'add_new']);

Route::get('/room_list', [RoomInfoController::class, 'index']);
Route::post('/room_list', [RoomInfoController::class, 'store']);
Route::put('/room_list/{id}', [RoomInfoController::class, 'update']);
Route::delete('/room_list/{id}', [RoomInfoController::class, 'destroy']);

Route::get('/booking_manager', [BookingManagerController::class, 'index']);
Route::put('/booking_manager/{id}', [BookingManagerController::class, 'update']);
Route::put('/users_manager/{id}', [UserController::class, 'update']);
Route::delete('/staff_manager/{id}', [UserController::class, 'destroy']);

Route::get('/special-offers', [SpecialOfferController::class, 'index']);
Route::put('/special-offers/{id}', [SpecialOfferController::class, 'update']);
Route::post('/send-offers', [OfferController::class, 'sendOffers']);

//Review User
Route::middleware([RememberTokenAuth::class])->group(function () {
    Route::get('/user-email', function (Request $request) {
        // Xác thực user
        $authHeader = $request->header('Authorization');
        if (!$authHeader || !str_starts_with($authHeader, 'Bearer ')) {
            return response()->json(['message' => 'Token missing or malformed'], 401);
        }

        $token = substr($authHeader, 7);
        $user = \App\Models\User::where('remember_token', $token)->first();

        if (!$user) {
            return response()->json(['message' => 'Unauthorized'], 401);
        }

        Auth::guard('web')->login($user);

        return response()->json(['email' => $user->email]);
    });

    Route::post('/reviews', [ReviewController::class, 'store']);
});
Route::get('/reviews', [ReviewController::class, 'indexUser']);

//Review Admin
Route::get('/admin/reviews', [ReviewController::class, 'indexAdmin']);
Route::delete('/reviews/{id}', [ReviewController::class, 'destroy']);

//Complaint
Route::middleware([RememberTokenAuth::class])->group(function () {
    Route::get('/user-info', function (Request $request) {
        $user = Auth::user();

        if (!$user) {
            return response()->json(['error' => 'Unauthenticated'], 401);
        }

        return response()->json([
            'id' => $user->id,
            'name' => $user->name,
            'email' => $user->email,
            'phone' => $user->phone,
        ]);
    });

    Route::post('/complaints', [ComplaintsController::class, 'store']);
});

//Complaint Admin
Route::get('/admin/employees', [ComplaintsController::class, 'getStaffList']);
Route::get('/admin/complaints', [ComplaintsController::class, 'indexAdmin']);
Route::put('/admin/complaints/{id}', [ComplaintsController::class, 'update']);
Route::delete('/admin/complaints/{id}', [ComplaintsController::class, 'destroy']);

//QRPayment
Route::middleware([RememberTokenAuth::class])->post('/payments', [PaymentController::class, 'store']);
