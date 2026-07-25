<?php

use Illuminate\Support\Facades\Route;
use Workbench\App\View\Components\LoadingSpinner;
use Workbench\App\View\Components\RandomSentence;

Route::get('/', function () {
    return view('workbench::operations-demo');
});

Route::post('/operations/refresh', function () {
    return bladex()->refresh(new RandomSentence);
});

Route::post('/operations/replace', function () {
    return bladex()->replace(new LoadingSpinner, new RandomSentence);
});
