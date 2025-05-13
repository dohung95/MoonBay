<?php

namespace App\Http\Controllers;

use App\Http\Controllers\Controller;
use App\Models\RoomInfo;
use Illuminate\Http\Request;
use Illuminate\Http\Response;

class RoomInfoController extends Controller
{
    /**
     * Hiển thị danh sách các phòng.
     *
     * @param Request $request
     * @return \Illuminate\Http\JsonResponse
     */
    public function index(Request $request)
    {
        try {
            $perPage = $request->input('per_page', 10); // Số bản ghi mỗi trang, mặc định 10
            $rooms = RoomInfo::paginate($perPage);

            return response()->json([
                'data' => $rooms->items(),
                'current_page' => $rooms->currentPage(),
                'last_page' => $rooms->lastPage(),
                'total' => $rooms->total(),
            ], Response::HTTP_OK);
        } catch (\Exception $e) {
            return response()->json([
                'message' => 'Unable to fetch room list.',
                'error' => $e->getMessage(),
            ], Response::HTTP_INTERNAL_SERVER_ERROR);
        }
    }
}