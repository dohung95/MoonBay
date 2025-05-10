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

    public function show()
    {
        $roomTypes = RoomType::all()->map(function ($roomType) {
            return [
                'id' => $roomType->id,
                'name' => $roomType->name,
                'price' => $roomType->price,
            ];
        });

        return response()->json(['room_types' => $roomTypes], 200);
    }
}
