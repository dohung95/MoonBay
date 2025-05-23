<?php

namespace App\Http\Controllers;

use Illuminate\Http\JsonResponse;
use App\Models\Hotel;

class HotelController extends Controller
{
    public function index(): JsonResponse
    {
        return response()->json(Hotel::all());
    }
}