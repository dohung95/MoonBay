<?php

namespace App\Http\Controllers;

use App\Http\Controllers\Controller;
use App\Models\SpecialOffer;

class SpecialOfferController extends Controller
{
    public function index()
{
    $offers = SpecialOffer::all();
    return response()->json($offers);
}
}