<?php

namespace App\Http\Controllers;

use App\Models\BookingManager;
use Illuminate\Http\Request;

class BookingManagerController extends Controller
{
    public function index()
    {
        $bookings = BookingManager::all();
        return response()->json($bookings);
    }
}
