<?php

use Illuminate\Support\Facades\Route;
use Workbench\App\View\Components\DemoChip;
use Workbench\App\View\Components\DemoRemovable;
use Workbench\App\View\Components\DemoSlot;
use Workbench\App\View\Components\LoadingSpinner;
use Workbench\App\View\Components\RandomSentence;

Route::get('/', function () {
    return view('workbench::operations-demo');
});

Route::post('/operations/refresh', function () {
    return response()->refresh(new RandomSentence);
});

Route::post('/operations/replace', function () {
    return response()->replace(new LoadingSpinner, new RandomSentence);
});

Route::post('/operations/remove', function () {
    return response()->remove(new DemoRemovable);
});

Route::post('/operations/append', function () {
    return response()->append(new DemoSlot, new DemoChip);
});

Route::post('/operations/prepend', function () {
    return response()->prepend(new DemoSlot, new DemoChip);
});

Route::post('/operations/redirect', function () {
    return response()->navigate(url('/').'#redirected');
});
