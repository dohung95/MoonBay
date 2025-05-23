<?php
namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\RoomType;
use App\Models\Booking;
use App\Models\RoomInfo;
use Carbon\Carbon;

class ChatbotController extends Controller
{
    public function handle(Request $request)
    {
        $userInput = strtolower($request->input('prompt'));
        if (!$userInput) {
            return response()->json(['error' => 'Missing prompt'], 400);
        }

        // Xem các loại phòng
        if (strpos($userInput, 'loại phòng') !== false) {
            $rooms = RoomType::pluck('name');
            if ($rooms->isEmpty()) {
                return response()->json(['response' => 'Hiện tại không có loại phòng nào trong hệ thống.']);
            }
            return response()->json(['response' => 'Các loại phòng: ' . $rooms->implode(', ')]);
        }

        // Kiểm tra phòng trống trong khoảng thời gian
        if (strpos($userInput, 'phòng trống') !== false) {
            $dates = $this->extractDateRange($userInput);
        
            if (!$dates['start'] || !$dates['end']) {
                return response()->json(['response' => 'Vui lòng cung cấp khoảng thời gian (VD: phòng trống từ 25/05/2025 đến 27/05/2025).']);
            }
        
            $bookedRoomIds = Booking::where(function ($query) use ($dates) {
                $query->where(function ($q) use ($dates) {
                    $q->where('checkin_date', '<=', $dates['end'])
                      ->where('checkout_date', '>=', $dates['start']);
                });
            })->pluck('room_id');
        
            $availableRooms = RoomInfo::whereNotIn('id', $bookedRoomIds)
                                     ->select('type', 'price')
                                     ->get();
        
            if ($availableRooms->isEmpty()) {
                return response()->json(['response' => 'Không có phòng trống trong khoảng thời gian từ ' . $dates['start']->format('d/m/Y') . ' đến ' . $dates['end']->format('d/m/Y') . '.']);
            }
        
            $roomSummary = $availableRooms->groupBy('type')->map(function ($rooms) {
                return [
                    'count' => $rooms->count(),
                    'price' => $rooms->first()->price
                ];
            });
        
            $response = "Phòng trống từ " . $dates['start']->format('d/m/Y') . " đến " . $dates['end']->format('d/m/Y') . ":\n\n";
            foreach ($roomSummary as $type => $info) {
                $response .= "Loại phòng {$type} còn {$info['count']} phòng trống, giá " . number_format($info['price'], 0, ',', '.') . " VNĐ/đêm\n\n";
            }
            return response()->json(['response' => $response]);
        }

        // Xem giá phòng
        if (strpos($userInput, 'giá phòng') !== false) {
            $rooms = RoomType::select('name', 'price')->get();
            if ($rooms->isEmpty()) {
                return response()->json(['response' => 'Hiện tại không có loại phòng nào trong hệ thống.']);
            }
            $response = "Giá các loại phòng:\n";
            foreach ($rooms as $room) {
                $response .= "- {$room->name}: " . number_format($room->price, 0, ',', '.') . " VNĐ/đêm\n\n";
            }
            return response()->json(['response' => $response]);
        }

        // Sức chứa
        if (strpos($userInput, 'sức chứa') !== false) {
            $rooms = RoomType::select('name', 'capacity')->get();
            if ($rooms->isEmpty()) {
                return response()->json(['response' => 'Hiện tại không có loại phòng nào trong hệ thống.']);
            }
            $response = "Sức chúa các loại phòng:\n";
            foreach ($rooms as $room) {
                $response .= "- {$room->name}: {$room->capacity} người\n";
            }
            return response()->json(['response' => $response]);
        }

        // Các câu hỏi khác
        if (strpos($userInput, 'giờ nhận phòng') !== false) {
            return response()->json(['response' => 'Giờ nhận phòng là 13:00 và giờ trả phòng là trước 12:00.']);
        }

        if (strpos($userInput, 'chính sách hủy') !== false) {
            return response()->json(['response' => 'Bạn có thể huỷ đặt phòng miễn phí trước 48 giờ so với ngày nhận phòng. Sau thời gian đó, bạn sẽ bị tính phí 100% giá trị đặt phòng.']);
        }

        return response()->json(['response' => 'Xin lỗi, tôi chưa hiểu câu hỏi của bạn. Bạn có thể hỏi về loại phòng, giá phòng, phòng trống, giờ nhận/trả phòng, hoặc chính sách huỷ?']);
    }

    private function extractDateRange($message)
    {
        preg_match_all('/\d{2}\/\d{2}\/\d{4}/', $message, $matches);
        $start = !empty($matches[0][0]) ? Carbon::createFromFormat('d/m/Y', $matches[0][0]) : null;
        $end = !empty($matches[0][1]) ? Carbon::createFromFormat('d/m/Y', $matches[0][1]) : null;
        return ['start' => $start, 'end' => $end];
    }
}