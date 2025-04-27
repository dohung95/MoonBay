<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\RoomType;

class RoomController extends Controller
{
    public function index()
    {
        // Lấy tất cả các loại phòng
        $roomTypes = RoomType::all();

        // Trả về dữ liệu dưới dạng JSON
        return response()->json($roomTypes);
    }
}
