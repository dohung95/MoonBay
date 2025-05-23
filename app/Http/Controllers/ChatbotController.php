<?php
namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\RoomType;
use App\Models\Booking;
use App\Models\RoomInfo;
use App\Models\SpecialOffer;
use Carbon\Carbon;

class ChatbotController extends Controller
{
    private function normalizeVietnamese($string)
    {
        $string = mb_strtolower($string, 'UTF-8');
        $trans = [
            'à' => 'a', 'á' => 'a', 'ả' => 'a', 'ã' => 'a', 'ạ' => 'a',
            'ă' => 'a', 'ằ' => 'a', 'ắ' => 'a', 'ẳ' => 'a', 'ẵ' => 'a', 'ặ' => 'a',
            'â' => 'a', 'ầu' => 'a', 'ấ' => 'a', 'ẩ' => 'a', 'ẫ' => 'a', 'ậ' => 'a',
            'è' => 'e', 'é' => 'e', 'ẻ' => 'e', 'ẽ' => 'e', 'ẹ' => 'e',
            'ê' => 'e', 'ề' => 'e', 'ế' => 'e', 'ể' => 'e', 'ễ' => 'e', 'ệ' => 'e',
            'ì' => 'i', 'í' => 'i', 'ỉ' => 'i', 'ĩ' => 'i', 'ị' => 'i',
            'ò' => 'o', 'ó' => 'o', 'ỏ' => 'o', 'õ' => 'o', 'ọ' => 'o',
            'ô' => 'o', 'ồ' => 'o', 'ố' => 'o', 'ổ' => 'o', 'ỗ' => 'o', 'ộ' => 'o',
            'ơ' => 'o', 'ờ' => 'o', 'ớ' => 'o', 'ở' => 'o', 'ỡ' => 'o', 'ợ' => 'o',
            'ù' => 'u', 'ú' => 'u', 'ủ' => 'u', 'ũ' => 'u', 'ụ' => 'u',
            'ư' => 'u', 'ừ' => 'u', 'ứ' => 'u', 'ử' => 'u', 'ữ' => 'u', 'ự' => 'u',
            'ỳ' => 'y', 'ý' => 'y', 'ỷ' => 'y', 'ỹ' => 'y', 'ỵ' => 'y',
        ];
        return strtr($string, $trans);
    }

    public function handle(Request $request)
    {
        $userInput = $request->input('prompt');
        if (!$userInput) {
            return response()->json(['error' => 'Missing prompt'], 400);
        }

        $normalizedInput = $this->normalizeVietnamese($userInput);

        // Đặt phòng
        if (
            preg_match('/\b(dat phong)\b/', $normalizedInput) ||
            preg_match('/\b(đặt phòng)\b/u', $userInput) ||
            $userInput === 'Làm thế nào để đặt phòng?'
        ) {
            return response()->json([
                'response' => "Bạn muốn đặt phòng? Vui lòng nhấp vào liên kết sau để đặt phòng: [Đặt phòng ngay](/booking#booknow)"
            ]);
        }

        // Xem ưu đãi
        if (
            preg_match('/\b(uu dai|khuyen mai)\b/', $normalizedInput) ||
            preg_match('/\b(ưu đãi|khuyến mãi)\b/u', $userInput) ||
            $userInput === 'Có ưu đãi nào đang áp dụng không?'
        ) {
            $today = Carbon::today();
            $offers = SpecialOffer::where(function ($query) use ($today) {
                $query->where(function ($q) use ($today) {
                    $q->where('season_start', '<=', $today)
                      ->where('season_end', '>=', $today);
                })->orWhere(function ($q) use ($today) {
                    $q->where('discount_start', '<=', $today)
                      ->where('discount_end', '>=', $today);
                })->orWhere(function ($q) use ($today) {
                    $q->where('gift_start', '<=', $today)
                      ->where('gift_end', '>=', $today);
                })->orWhere(function ($q) use ($today) {
                    $q->where('other_offer_start', '<=', $today)
                      ->where('other_offer_end', '>=', $today);
                });
            })->get();

            if ($offers->isEmpty()) {
                return response()->json(['response' => "Hiện tại không có ưu đãi nào đang áp dụng. Hãy đặt phòng tại: [Đặt phòng ngay](/booking#booknow)"]);
            }

            $response = "Các ưu đãi hiện tại:\n\n";
            foreach ($offers as $offer) {
                if ($offer->season && $offer->season_start <= $today && $offer->season_end >= $today) {
                    $response .= "- Mùa: {$offer->season}\n";
                    if ($offer->free_services) {
                        $response .= "  Dịch vụ miễn phí: {$offer->free_services}\n";
                    }
                    $response .= "  Thời gian: {$offer->season_start->format('d/m/Y')} - {$offer->season_end->format('d/m/Y')}\n\n";
                }
                if ($offer->discount_percent && $offer->discount_start <= $today && $offer->discount_end >= $today) {
                    $response .= "- Chiết khấu: {$offer->discount_percent}% cho hóa đơn từ " . number_format($offer->total_bill_threshold, 0, ',', '.') . " VNĐ\n";
                    $response .= "  Thời gian: {$offer->discount_start->format('d/m/Y')} - {$offer->discount_end->format('d/m/Y')}\n\n";
                }
                if ($offer->gift_description && $offer->gift_start <= $today && $offer->gift_end >= $today) {
                    $response .= "- Quà tặng: {$offer->gift_description} khi ở {$offer->stay_duration_days} ngày\n";
                    $response .= "  Thời gian: {$offer->gift_start->format('d/m/Y')} - {$offer->gift_end->format('d/m/Y')}\n\n";
                }
                if ($offer->other_package_description && $offer->other_offer_start <= $today && $offer->other_offer_end >= $today) {
                    $response .= "- Gói ưu đãi khác: {$offer->other_package_description}\n";
                    $response .= "  Thời gian: {$offer->other_offer_start->format('d/m/Y')} - {$offer->other_offer_end->format('d/m/Y')}\n\n";
                }
            }
            $response .= "Để tận dụng các ưu đãi, hãy đặt phòng ngay: [Đặt phòng ngay](/booking#booknow)";
            return response()->json(['response' => $response]);
        }

        // Xem các loại phòng
        if (preg_match('/\b(loai phong)\b/', $normalizedInput)) {
            $rooms = RoomType::pluck('name');
            if ($rooms->isEmpty()) {
                return response()->json(['response' => 'Hiện tại không có loại phòng nào trong hệ thống.']);
            }
            return response()->json(['response' => 'Các loại phòng: ' . $rooms->implode(', ')]);
        }

        // Kiểm tra phòng trống trong khoảng thời gian
        if (preg_match('/\b(phong trong)\b/', $normalizedInput)) {
            $dates = $this->extractDateRange($userInput);
        
            if (!$dates['start'] || !$dates['end']) {
                return response()->json(['response' => 'Vui lòng cung cấp đầy đủ khoảng thời gian (VD: phòng trống từ 25/05/2025 đến 27/05/2025).']);
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
        if (preg_match('/\b(gia phong)\b/', $normalizedInput)) {
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
        if (preg_match('/\b(suc chua)\b/', $normalizedInput)) {
            $rooms = RoomType::select('name', 'capacity')->get();
            if ($rooms->isEmpty()) {
                return response()->json(['response' => 'Hiện tại không có loại phòng nào trong hệ thống.']);
            }
            $response = "Sức chứa các loại phòng:\n";
            foreach ($rooms as $room) {
                $response .= "- {$room->name}: {$room->capacity} người\n";
            }
            return response()->json(['response' => $response]);
        }

        // Các câu hỏi khác
        if (preg_match('/\b(gio nhan phong)\b/', $normalizedInput)) {
            return response()->json(['response' => 'Giờ nhận phòng là 13:00 và giờ trả phòng là trước 12:00.']);
        }

        if (preg_match('/\b(chinh sach huy)\b/', $normalizedInput)) {
            return response()->json(['response' => 'Bạn có thể huỷ đặt phòng miễn phí trước 48 giờ so với ngày nhận phòng. Sau thời gian đó, bạn sẽ bị tính phí 100% giá trị đặt phòng.']);
        }

        return response()->json(['response' => 'Xin lỗi, tôi chưa hiểu câu hỏi của bạn. Bạn có thể hỏi về loại phòng, giá phòng, phòng trống, giờ nhận/trả phòng, hoặc chính sách huỷ?']);
    }

    private function extractDateRange($message)
    {
        preg_match_all('/\d{2}[\/-]\d{2}[\/-]\d{4}/', $message, $matches);
        $start = null;
        $end = null;

        if (!empty($matches[0][0])) {
            $startDate = str_replace('-', '/', $matches[0][0]);
            $start = Carbon::createFromFormat('d/m/Y', $startDate);
        }
        if (!empty($matches[0][1])) {
            $endDate = str_replace('-', '/', $matches[0][1]);
            $end = Carbon::createFromFormat('d/m/Y', $endDate);
        }

        return ['start' => $start, 'end' => $end];
    }
}