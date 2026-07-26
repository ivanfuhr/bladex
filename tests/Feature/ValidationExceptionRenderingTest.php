<?php

declare(strict_types=1);

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Support\Facades\Route;

class BladeXValidationTestRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    /**
     * @return array<string, list<string>>
     */
    public function rules(): array
    {
        return [
            'title' => ['required', 'string', 'min:3'],
        ];
    }
}

beforeEach(function () {
    Route::post('/_bladex/test/form-request-validation', function (BladeXValidationTestRequest $request) {
        return response()->json(['validated' => $request->validated()]);
    });
});

it('returns a bladex validation payload when a form request fails on a json request', function () {
    $this->postJson('/_bladex/test/form-request-validation', [], [
        'X-BladeX-Request' => 'true',
    ])
        ->assertUnprocessable()
        ->assertHeader('X-BladeX', 'true')
        ->assertJsonPath('operations', [])
        ->assertJsonStructure([
            'operations',
            'errors' => [
                ['name', 'messages'],
            ],
        ])
        ->assertJsonPath('errors.0.name', 'title');
});

it('returns laravel default validation json for non bladex json requests when configured', function () {
    config(['bladex.treat_json_validation_as_bladex' => false]);

    $response = $this->postJson('/_bladex/test/form-request-validation', [], [
        'X-BladeX-Request' => 'false',
    ]);

    $response
        ->assertUnprocessable()
        ->assertJsonStructure(['message', 'errors']);

    expect($response->json())->not->toHaveKey('operations');

    expect($response->headers->get('X-BladeX'))->not->toBe('true');
});

it('returns a bladex validation payload for expectsJson requests by default', function () {
    $this->postJson('/_bladex/test/form-request-validation', [])
        ->assertUnprocessable()
        ->assertHeader('X-BladeX', 'true')
        ->assertJsonPath('operations', []);
});
