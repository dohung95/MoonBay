<?php

namespace App\Http\Controllers;

use App\Models\BookingManager;
use Illuminate\Http\Request;
use App\Models\BookingRoom;
use Illuminate\Support\Facades\DB;

class ChartController extends Controller
{
    public function bookingsRatio($year)
    {
        // Số booking tối đa trong một tháng: 60 phòng * 15 booking/phòng
        $maxBookings = 60 * 15; // 900 booking

        // Tổng số booking thực tế theo tháng trong năm được chọn
        $bookings = BookingManager::select(
            DB::raw('MONTH(checkin_date) as month'),
            DB::raw('COUNT(id) as booking_count') // Đếm số booking
        )
            ->whereYear('checkin_date', $year)
            ->where('check_status', 'checked in') // Chỉ tính các booking đã check-in
            ->groupBy(DB::raw('MONTH(checkin_date)'))
            ->orderBy('month')
            ->get();

        // Tạo mảng dữ liệu cho 12 tháng
        $data = [];
        for ($month = 1; $month <= 12; $month++) {
            $booking = $bookings->firstWhere('month', $month) ?? ['booking_count' => 0];
            $ratio = $maxBookings > 0 ? min(($booking['booking_count'] / $maxBookings) * 100, 100) : 0;
            $data[] = [
                'month' => $month,
                'ratio' => round($ratio, 2),
            ];
        }

        return response()->json($data);
    }

    public function revenue($year)
    {
        // Tổng doanh số theo tháng trong năm được chọn
        $revenue = BookingManager::select(
            DB::raw('MONTH(checkin_date) as month'),
            DB::raw('COALESCE(SUM(total_price), 0) as total_revenue')
        )
            ->whereYear('checkin_date', $year)
            ->where('check_status', 'checked in') // Chỉ tính các booking đã check-in
            ->groupBy(DB::raw('MONTH(checkin_date)'))
            ->orderBy('month')
            ->get();

        // Tạo mảng dữ liệu cho 12 tháng
        $data = [];
        for ($month = 1; $month <= 12; $month++) {
            $rev = $revenue->firstWhere('month', $month) ?? ['total_revenue' => 0];
            $data[] = [
                'month' => $month,
                'total_revenue' => round($rev['total_revenue'], 2),
            ];
        }

        return response()->json($data);
    }
}