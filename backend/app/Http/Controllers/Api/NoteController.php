<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Note;
use App\Models\User;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class NoteController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        /** @var User $user */
        $user = $request->user();

        $perPage = min(100, max(1, (int) $request->query('per_page', 20)));

        $query = $user->notes()
            ->orderByDesc('pinned')
            ->latest();

        if ($search = $request->query('search')) {
            $term = '%'.addcslashes((string) $search, '%_\\').'%';
            $query->where(function ($q) use ($term): void {
                $q->where('title', 'like', $term)
                    ->orWhere('body', 'like', $term);
            });
        }

        return response()->json($query->paginate($perPage));
    }

    public function store(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'title' => ['required', 'string', 'max:255'],
            'body' => ['nullable', 'string'],
            'pinned' => ['sometimes', 'boolean'],
        ]);

        /** @var User $user */
        $user = $request->user();
        $note = $user->notes()->create($validated);

        return response()->json($note, Response::HTTP_CREATED);
    }

    public function show(Request $request, string $note): JsonResponse
    {
        $model = $this->noteForUser($request, $note);

        return response()->json($model);
    }

    public function update(Request $request, string $note): JsonResponse
    {
        $validated = $request->validate([
            'title' => ['sometimes', 'string', 'max:255'],
            'body' => ['sometimes', 'nullable', 'string'],
            'pinned' => ['sometimes', 'boolean'],
        ]);

        $model = $this->noteForUser($request, $note);
        $model->update($validated);

        return response()->json($model->fresh());
    }

    public function destroy(Request $request, string $note): JsonResponse
    {
        $model = $this->noteForUser($request, $note);
        $model->delete();

        return response()->json(null, Response::HTTP_NO_CONTENT);
    }

    protected function noteForUser(Request $request, string $noteId): Note
    {
        /** @var User $user */
        $user = $request->user();

        return $user->notes()->whereKey($noteId)->firstOrFail();
    }
}
