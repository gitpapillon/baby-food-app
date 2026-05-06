import { useState } from 'react';
import { useUserStore } from '../store/useUserStore';

type Filter = 'all' | 'open' | 'done';

export function RequestsView() {
  const { requests, addRequest, toggleRequestDone, editRequest, deleteRequest } = useUserStore();
  const [draft, setDraft] = useState('');
  const [filter, setFilter] = useState<Filter>('all');
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editingText, setEditingText] = useState('');

  const filtered = requests.filter(r => {
    if (filter === 'open') return !r.done;
    if (filter === 'done') return r.done;
    return true;
  });

  const openCount = requests.filter(r => !r.done).length;
  const doneCount = requests.length - openCount;

  const handleAdd = () => {
    const text = draft.trim();
    if (!text) return;
    addRequest(text);
    setDraft('');
  };

  const startEdit = (id: string, current: string) => {
    setEditingId(id);
    setEditingText(current);
  };

  const saveEdit = () => {
    if (!editingId) return;
    const text = editingText.trim();
    if (text) editRequest(editingId, text);
    setEditingId(null);
    setEditingText('');
  };

  return (
    <div className="pb-4">
      <div className="sticky top-0 bg-white z-10 border-b border-gray-100 p-4 space-y-3">
        <div className="flex items-center justify-between">
          <h1 className="text-lg font-bold text-gray-900">요청사항</h1>
          <span className="text-sm text-gray-500">미해결 {openCount} · 완료 {doneCount}</span>
        </div>

        <div className="flex gap-2">
          <input
            type="text"
            value={draft}
            onChange={e => setDraft(e.target.value)}
            onKeyDown={e => { if (e.key === 'Enter') handleAdd(); }}
            placeholder="요청사항/메모를 입력하세요"
            className="flex-1 border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-400"
          />
          <button
            onClick={handleAdd}
            disabled={!draft.trim()}
            className="px-4 py-2 bg-green-500 text-white rounded-xl text-sm font-semibold disabled:bg-gray-200 disabled:text-gray-400"
          >
            추가
          </button>
        </div>

        <div className="flex gap-2">
          {(['all','open','done'] as Filter[]).map(f => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`text-xs px-3 py-1.5 rounded-full border transition-colors ${
                filter === f ? 'bg-green-500 text-white border-green-500' : 'bg-white text-gray-600 border-gray-300'
              }`}
            >
              {f === 'all' ? '전체' : f === 'open' ? '미해결' : '완료'}
            </button>
          ))}
        </div>
      </div>

      <div className="px-4 pt-3">
        {filtered.length === 0 ? (
          <div className="text-center py-12 space-y-1">
            <p className="text-gray-500 text-sm">
              {requests.length === 0 ? '아직 등록된 요청사항이 없습니다.' : '조건에 맞는 항목이 없습니다.'}
            </p>
            {requests.length === 0 && (
              <p className="text-gray-400 text-xs">앱 사용 중 떠오르는 메모, 추가하고 싶은 재료/레시피 등을 자유롭게 적어두세요.</p>
            )}
          </div>
        ) : (
          <ul className="space-y-2">
            {filtered.map(r => (
              <li
                key={r.id}
                className={`bg-white border rounded-xl p-3 shadow-sm ${r.done ? 'border-gray-100 opacity-60' : 'border-gray-200'}`}
              >
                {editingId === r.id ? (
                  <div className="flex items-start gap-2">
                    <textarea
                      value={editingText}
                      onChange={e => setEditingText(e.target.value)}
                      autoFocus
                      rows={2}
                      className="flex-1 border border-gray-200 rounded-lg px-2 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-green-400 resize-none"
                    />
                    <div className="flex flex-col gap-1">
                      <button
                        onClick={saveEdit}
                        className="text-xs px-2 py-1 bg-green-500 text-white rounded-md"
                      >
                        저장
                      </button>
                      <button
                        onClick={() => { setEditingId(null); setEditingText(''); }}
                        className="text-xs px-2 py-1 bg-gray-100 text-gray-600 rounded-md"
                      >
                        취소
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="flex items-start gap-3">
                    <button
                      onClick={() => toggleRequestDone(r.id)}
                      className={`mt-0.5 w-5 h-5 rounded-full border-2 flex items-center justify-center flex-shrink-0 ${
                        r.done ? 'bg-green-500 border-green-500' : 'border-gray-300'
                      }`}
                      aria-label={r.done ? '미해결로 변경' : '완료로 변경'}
                    >
                      {r.done && <span className="text-white text-xs leading-none">✓</span>}
                    </button>
                    <div className="flex-1 min-w-0">
                      <p className={`text-sm whitespace-pre-wrap break-words ${r.done ? 'line-through text-gray-400' : 'text-gray-800'}`}>
                        {r.text}
                      </p>
                      <p className="text-xs text-gray-400 mt-1">
                        {new Date(r.createdAt).toLocaleDateString('ko-KR', { year: 'numeric', month: 'long', day: 'numeric' })}
                      </p>
                    </div>
                    <div className="flex flex-col gap-1 flex-shrink-0">
                      <button
                        onClick={() => startEdit(r.id, r.text)}
                        className="text-xs text-gray-500 px-1.5 py-0.5"
                      >
                        수정
                      </button>
                      <button
                        onClick={() => {
                          if (confirm('삭제하시겠습니까?')) deleteRequest(r.id);
                        }}
                        className="text-xs text-red-400 px-1.5 py-0.5"
                      >
                        삭제
                      </button>
                    </div>
                  </div>
                )}
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
