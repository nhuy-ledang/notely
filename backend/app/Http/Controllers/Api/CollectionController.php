<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Collection;
use App\Models\User;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class CollectionController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        /** @var User $user */
        $user = $request->user();

        $collections = $user->collections()
            ->withCount('notes')
            ->orderBy('name')
            ->get();

        return response()->json($collections);
    }

    public function store(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'name' => ['required', 'string', 'max:255'],
            'description' => ['nullable', 'string'],
            'icon' => ['nullable', 'string', 'max:64'],
            'accent' => ['sometimes', 'string', 'in:default,warm'],
        ]);

        /** @var User $user */
        $user = $request->user();
        if (! array_key_exists('accent', $validated)) {
            $validated['accent'] = 'default';
        }

        $collection = $user->collections()->create($validated);
        $collection->loadCount('notes');

        return response()->json($collection, Response::HTTP_CREATED);
    }

    public function show(Request $request, string $collection): JsonResponse
    {
        $model = $this->collectionForUser($request, $collection);
        $model->loadCount('notes');

        return response()->json($model);
    }

    public function update(Request $request, string $collection): JsonResponse
    {
        $validated = $request->validate([
            'name' => ['sometimes', 'string', 'max:255'],
            'description' => ['sometimes', 'nullable', 'string'],
            'icon' => ['sometimes', 'nullable', 'string', 'max:64'],
            'accent' => ['sometimes', 'string', 'in:default,warm'],
        ]);

        $model = $this->collectionForUser($request, $collection);
        $model->update($validated);

        return response()->json($model->fresh()->loadCount('notes'));
    }

    public function destroy(Request $request, string $collection): JsonResponse
    {
        $model = $this->collectionForUser($request, $collection);
        $model->delete();

        return response()->json(null, Response::HTTP_NO_CONTENT);
    }

    protected function collectionForUser(Request $request, string $collectionId): Collection
    {
        /** @var User $user */
        $user = $request->user();

        return $user->collections()->whereKey($collectionId)->firstOrFail();
    }
}
