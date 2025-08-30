
      const { useEffect, useMemo, useRef, useState } = React;

      const API_BASE = "https://movie.azurewebsites.net/api/cartelera";

      const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

      const posterFallback =
        "https://dummyimage.com/480x720/dae1e7/1f2937.jpg&text=Sin+Póster";

      function classNames(...xs) {
        return xs.filter(Boolean).join(" ");
      }

      function buildListUrl({ title = "", ubication = "" }) {
        const p = new URLSearchParams();
        p.set("title", title.trim());
        p.set("ubication", ubication.trim());
        return `${API_BASE}?${p.toString()}`;
      }

      async function fetchJson(url, opts = {}, { useProxy = false } = {}) {
        try {
          const res = await fetch(url, { ...opts, mode: "cors" });
          if (!res.ok) throw new Error(`HTTP ${res.status}`);
          const ct = res.headers.get("content-type") || "";
          if (!ct.includes("application/json")) {

            return await res.json();
          }
          return await res.json();
        } catch (err) {
          if (!useProxy) throw err; 

          if ((opts.method || "GET").toUpperCase() !== "GET") throw err;

          try {
            const u1 = `https://api.allorigins.win/get?url=${encodeURIComponent(
              url
            )}&nocache=${Date.now()}`;
            const pr = await fetch(u1);
            if (!pr.ok) throw new Error("Proxy1 fail");
            const data = await pr.json();
            return JSON.parse(data.contents);
          } catch (e) {

            const u2 = `https://thingproxy.freeboard.io/fetch/${encodeURIComponent(
              url
            )}?nocache=${Date.now()}`;
            const pr2 = await fetch(u2);
            if (!pr2.ok) throw new Error("Proxy2 fail");
            return await pr2.json();
          }
        }
      }

      function Badge({ children }) {
        return (
          <span className="inline-flex items-center rounded-full bg-slate-100 text-slate-700 px-2.5 py-1 text-xs font-medium">
            {children}
          </span>
        );
      }

      function Switch({ checked, onChange, label, hint }) {
        return (
          <label className="flex items-start gap-3 select-none cursor-pointer">
            <span className="relative inline-flex h-6 w-11 items-center">
              <input
                type="checkbox"
                className="sr-only"
                checked={checked}
                onChange={(e) => onChange(e.target.checked)}
              />
              <span
                className={classNames(
                  "absolute inset-0 rounded-full transition",
                  checked ? "bg-indigo-600" : "bg-slate-300"
                )}
              ></span>
              <span
                className={classNames(
                  "absolute left-0.5 top-0.5 h-5 w-5 rounded-full bg-white shadow ring-0 transition-transform",
                  checked ? "translate-x-5" : ""
                )}
              ></span>
            </span>
            <span>
              <span className="block text-sm font-medium">{label}</span>
              {hint && (
                <span className="block text-xs text-slate-500">{hint}</span>
              )}
            </span>
          </label>
        );
      }

      function Modal({ open, onClose, title, children, footer }) {
        if (!open) return null;
        return (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-black/40 backdrop"></div>
            <div className="relative w-full max-w-2xl rounded-2xl bg-white shadow-soft">
              <div className="flex items-center justify-between border-b px-5 py-3">
                <h3 className="text-lg font-semibold">{title}</h3>
                <button
                  className="rounded-full p-2 hover:bg-slate-100"
                  onClick={onClose}
                  aria-label="Cerrar"
                >
                  ✕
                </button>
              </div>
              <div className="px-5 py-4">{children}</div>
              <div className="flex items-center justify-end gap-2 border-t px-5 py-3">
                {footer}
              </div>
            </div>
          </div>
        );
      }

      function Toast({ show, tone = "success", text }) {
        if (!show) return null;
        const toneMap = {
          success: "bg-emerald-50 text-emerald-800 border-emerald-200",
          error: "bg-rose-50 text-rose-800 border-rose-200",
          info: "bg-sky-50 text-sky-800 border-sky-200",
        };
        return (
          <div
            className={classNames(
              "fixed bottom-5 left-1/2 -translate-x-1/2 z-50 rounded-xl border px-4 py-2 shadow-soft",
              toneMap[tone]
            )}
          >
            <span className="text-sm">{text}</span>
          </div>
        );
      }

      function MovieForm({ value, onChange, readOnlyId = false }) {
        const v = value;
        const set = (k, val) => onChange({ ...v, [k]: val });
        return (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium">imdbID</label>
              <input
                className="mt-1 w-full rounded-xl border border-slate-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                value={v.imdbID || ""}
                onChange={(e) => set("imdbID", e.target.value)}
                placeholder="80000"
                disabled={readOnlyId} 
              />
            </div>
            <div>
              <label className="block text-sm font-medium">Título</label>
              <input
                className="mt-1 w-full rounded-xl border px-3 py-2 focus:ring-2 focus:ring-indigo-500"
                value={v.Title || ""}
                onChange={(e) => set("Title", e.target.value)}
                placeholder="Titanes del Atlántico"
              />
            </div>
            <div>
              <label className="block text-sm font-medium">Año</label>
              <input
                className="mt-1 w-full rounded-xl border px-3 py-2"
                value={v.Year || ""}
                onChange={(e) => set("Year", e.target.value)}
                placeholder="2013"
              />
            </div>
            <div>
              <label className="block text-sm font-medium">Tipo / Género</label>
              <input
                className="mt-1 w-full rounded-xl border px-3 py-2"
                value={v.Type || ""}
                onChange={(e) => set("Type", e.target.value)}
                placeholder="Ciencia Ficción"
              />
            </div>
            <div className="md:col-span-2">
              <label className="block text-sm font-medium">Póster (URL)</label>
              <input
                className="mt-1 w-full rounded-xl border px-3 py-2"
                value={v.Poster || ""}
                onChange={(e) => set("Poster", e.target.value)}
                placeholder="https://...jpg"
              />
            </div>
            <div className="md:col-span-2">
              <label className="block text-sm font-medium">Descripción</label>
              <textarea
                className="mt-1 w-full rounded-xl border px-3 py-2"
                rows={3}
                value={v.description || ""}
                onChange={(e) => set("description", e.target.value)}
                placeholder="Sinopsis..."
              />
            </div>
            <div>
              <label className="block text-sm font-medium">
                Ubicación / Cine
              </label>
              <input
                className="mt-1 w-full rounded-xl border px-3 py-2"
                value={v.Ubication || ""}
                onChange={(e) => set("Ubication", e.target.value)}
                placeholder="POPCINEMA"
              />
            </div>
            <div className="flex items-center gap-2">
              <input
                id="estado"
                type="checkbox"
                className="h-4 w-4"
                checked={!!v.Estado}
                onChange={(e) => set("Estado", e.target.checked)}
              />
              <label htmlFor="estado" className="text-sm">
                En cartelera
              </label>
            </div>
          </div>
        );
      }

      function App() {
        const [query, setQuery] = useState("");
        const [ubication, setUbication] = useState("");
        const [items, setItems] = useState([]);
        const [loading, setLoading] = useState(false);
        const [error, setError] = useState("");
        const [onlyActive, setOnlyActive] = useState(false);
        const [typeFilter, setTypeFilter] = useState("");
        const [yearFrom, setYearFrom] = useState("");
        const [yearTo, setYearTo] = useState("");
        const [sortBy, setSortBy] = useState("titleAsc");
        const [selected, setSelected] = useState(null);
        const [showEditor, setShowEditor] = useState(false);
        const [editorModel, setEditorModel] = useState({});
        const [editingId, setEditingId] = React.useState(null);
        const [toast, setToast] = useState({
          show: false,
          tone: "success",
          text: "",
        });
        const [page, setPage] = useState(1);
        const pageSize = 12;

        const uniqueUbications = useMemo(
          () =>
            Array.from(
              new Set(
                items.map((m) => (m.Ubication || "").trim()).filter(Boolean)
              )
            ).sort(),
          [items]
        );
        const uniqueTypes = useMemo(
          () =>
            Array.from(
              new Set(items.map((m) => (m.Type || "").trim()).filter(Boolean))
            ).sort(),
          [items]
        );

        const filtered = useMemo(() => {
          let list = items.slice();
          if (onlyActive)
            list = list.filter((m) => m.Estado === true || m.Estado === "true");
          if (typeFilter)
            list = list.filter((m) =>
              (m.Type || "").toLowerCase().includes(typeFilter.toLowerCase())
            );
          if (yearFrom)
            list = list.filter((m) => parseInt(m.Year) >= parseInt(yearFrom));
          if (yearTo)
            list = list.filter((m) => parseInt(m.Year) <= parseInt(yearTo));
          switch (sortBy) {
            case "yearDesc":
              list.sort(
                (a, b) => (parseInt(b.Year) || 0) - (parseInt(a.Year) || 0)
              );
              break;
            case "yearAsc":
              list.sort(
                (a, b) => (parseInt(a.Year) || 0) - (parseInt(b.Year) || 0)
              );
              break;
            case "titleDesc":
              list.sort(
                (a, b) =>
                  (a.Title || "").localeCompare(b.Title || "", "es", {
                    sensitivity: "base",
                  }) * -1
              );
              break;
            default:
              list.sort((a, b) =>
                (a.Title || "").localeCompare(b.Title || "", "es", {
                  sensitivity: "base",
                })
              );
          }
          return list;
        }, [items, onlyActive, typeFilter, yearFrom, yearTo, sortBy]);

        const paginated = useMemo(() => {
          const start = (page - 1) * pageSize;
          return filtered.slice(start, start + pageSize);
        }, [filtered, page]);

        const load = async () => {
          setLoading(true);
          setError("");
          try {
            const url = buildListUrl({ title: query, ubication });
            const data = await fetchJson(url);

            const arr = Array.isArray(data) ? data : data ? [data] : [];
            setItems(arr);
            setPage(1);
          } catch (e) {
            setError(e.message || "Error al cargar datos");
          } finally {
            setLoading(false);
          }
        };

        useEffect(() => {
          load();
        }, []);

        const debounceRef = useRef(0);
        useEffect(() => {
          clearTimeout(debounceRef.current);
          debounceRef.current = setTimeout(load, 450);
          return () => clearTimeout(debounceRef.current);
        }, [query, ubication]);

        const showToast = (tone, text) => {
          setToast({ show: true, tone, text });
          setTimeout(() => setToast((t) => ({ ...t, show: false })), 1800);
        };

        const onCreate = async () => {
          const id = (editorModel.imdbID || "").toString().trim();
          if (!id || !editorModel.Title) {
            showToast("error", "imdbID y Título son obligatorios");
            return;
          }

          try {
            const res = await fetch(API_BASE, {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify(editorModel),
            });
            if (!res.ok) throw new Error(`HTTP ${res.status}`);
            showToast("success", "Creado correctamente");
            setShowEditor(false);
            await load();
          } catch (e) {
            showToast("error", "No se pudo crear (¿CORS/permisos?)");
            console.error(e);
          }
        };

        const onUpdate = async () => {
          if (!editingId) {
            showToast("error", "Falta id para actualizar");
            return;
          }

          try {
            const url = `${API_BASE}?imdbID=${encodeURIComponent(editingId)}`;

            const payload = { ...editorModel, imdbID: editingId };

            const res = await fetch(url, {
              method: "PUT",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify(payload),
            });
            if (!res.ok) throw new Error(`HTTP ${res.status}`);

            showToast("success", "Actualizado correctamente");
            setShowEditor(false);
            await load();
          } catch (e) {
            showToast("error", "No se pudo actualizar");
            console.error(e);
          }
        };

        const onDelete = async (id) => {
          if (!confirm("¿Eliminar esta película?")) return;
          try {
            const url = `${API_BASE}?imdbID=${encodeURIComponent(id)}`;
            const res = await fetch(url, { method: "DELETE" });
            if (!res.ok) throw new Error(`HTTP ${res.status}`);
            showToast("success", "Eliminado correctamente");
            setSelected(null);
            await load();
          } catch (e) {
            showToast("error", "No se pudo eliminar");
            console.error(e);
          }
        };

        const resetFilters = () => {
          setQuery("");
          setUbication("");
          setOnlyActive(false);
          setTypeFilter("");
          setYearFrom("");
          setYearTo("");
          setSortBy("titleAsc");
          setPage(1);
        };

        return (
          <div className="mx-auto max-w-7xl p-4 md:p-6">
            {/* Header */}
            <header className="mb-6 flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
              <div className="flex items-center gap-3">
                <div className="rounded-2xl bg-indigo-600 text-white p-2.5 shadow-soft">
                  <img
                    src="./MiCine.png"
                    alt="Mi Cine"
                    className="block w-12 h-12 md:w-16 md:h-16 object-contain"
                  />
                </div>
                <div>
                  <h1 className="text-2xl md:text-3xl font-bold">Cinema</h1>
                </div>
              </div>
            </header>

            {/* Controls */}
            <section className="mb-5 grid grid-cols-1 gap-3 md:grid-cols-12">
              <div className="md:col-span-4">
                <label className="block text-sm font-medium">
                  Buscar por título
                </label>
                <input
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="Ej. Titanic"
                  className="mt-1 w-full rounded-xl border px-3 py-2 focus:ring-2 focus:ring-indigo-500"
                />
              </div>
              <div className="md:col-span-3">
                <label className="block text-sm font-medium">Ubicación</label>
                <select
                  value={ubication}
                  onChange={(e) => setUbication(e.target.value)}
                  className="mt-1 w-full rounded-xl border px-3 py-2"
                >
                  <option value="">Todas</option>
                  {uniqueUbications.map((u) => (
                    <option key={u} value={u}>
                      {u}
                    </option>
                  ))}
                </select>
              </div>
              <div className="md:col-span-2">
                <label className="block text-sm font-medium">Tipo</label>
                <select
                  value={typeFilter}
                  onChange={(e) => setTypeFilter(e.target.value)}
                  className="mt-1 w-full rounded-xl border px-3 py-2"
                >
                  <option value="">Todos</option>
                  {uniqueTypes.map((t) => (
                    <option key={t} value={t}>
                      {t}
                    </option>
                  ))}
                </select>
              </div>
              <div className="md:col-span-3 flex items-end gap-2">
                <button
                  onClick={load}
                  className="w-full md:w-auto rounded-xl bg-indigo-600 px-4 py-2 font-medium text-white hover:bg-indigo-700"
                >
                  Refrescar
                </button>
                <button
                  onClick={resetFilters}
                  className="w-full md:w-auto rounded-xl border px-4 py-2 font-medium hover:bg-slate-50"
                >
                  Limpiar
                </button>
              </div>
              <div className="md:col-span-12 grid grid-cols-2 md:grid-cols-6 gap-3">
                <div>
                  <label className="block text-sm font-medium">Año desde</label>
                  <input
                    value={yearFrom}
                    onChange={(e) => setYearFrom(e.target.value)}
                    placeholder="1990"
                    className="mt-1 w-full rounded-xl border px-3 py-2"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium">Año hasta</label>
                  <input
                    value={yearTo}
                    onChange={(e) => setYearTo(e.target.value)}
                    placeholder="2025"
                    className="mt-1 w-full rounded-xl border px-3 py-2"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium">
                    Ordenar por
                  </label>
                  <select
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value)}
                    className="mt-1 w-full rounded-xl border px-3 py-2"
                  >
                    <option value="titleAsc">Título (A→Z)</option>
                    <option value="titleDesc">Título (Z→A)</option>
                    <option value="yearDesc">Año (Nuevo→Viejo)</option>
                    <option value="yearAsc">Año (Viejo→Nuevo)</option>
                  </select>
                </div>
                <div className="flex items-end">
                  <Switch
                    checked={onlyActive}
                    onChange={setOnlyActive}
                    label="Solo en cartelera"
                  />
                </div>
              </div>
            </section>

            <div className="mb-4 flex items-center justify-between">
              <p className="text-sm text-slate-600">
                {filtered.length} resultado(s)
              </p>
              <button
                onClick={() => {
                  setEditorModel({ Estado: true });
                  setEditingId(null);
                  setShowEditor(true);
                }}
                className="rounded-xl bg-emerald-600 px-4 py-2 text-white hover:bg-emerald-700"
              >
                Agregar película
              </button>
            </div>

            {/* Grid */}
            {loading ? (
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
                {Array.from({ length: 8 }).map((_, i) => (
                  <div
                    key={i}
                    className="rounded-2xl border bg-white p-3 shadow-soft animate-pulse"
                  >
                    <div className="aspect-[2/3] w-full rounded-xl bg-slate-200"></div>
                    <div className="mt-3 h-4 w-3/4 rounded bg-slate-200"></div>
                    <div className="mt-2 h-4 w-1/2 rounded bg-slate-200"></div>
                  </div>
                ))}
              </div>
            ) : error ? (
              <div className="rounded-2xl border border-rose-200 bg-rose-50 p-4 text-rose-800">
                <p className="font-medium">Error al cargar</p>
                <p className="text-sm">
                  {error}. Si estás en GitHub Pages, activa "Usar proxy CORS
                  (GET)".
                </p>
              </div>
            ) : (
              <>
                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
                  {paginated.map((m) => (
                    <article
                      key={m.imdbID}
                      className="group rounded-2xl border bg-white p-3 shadow-soft transition hover:-translate-y-0.5 hover:shadow-lg"
                    >
                      <div className="relative aspect-[2/3] overflow-hidden rounded-xl bg-slate-100">
                        <img
                          src={m.Poster || posterFallback}
                          onError={(e) => {
                            e.currentTarget.src = posterFallback;
                          }}
                          alt={m.Title}
                          className="h-full w-full object-cover transition group-hover:scale-[1.02]"
                        />
                        {m.Estado ? (
                          <span className="absolute left-2 top-2 rounded-full bg-emerald-600/90 px-2 py-1 text-[11px] font-semibold text-white">
                            En cartelera
                          </span>
                        ) : null}
                      </div>
                      <h3 className="mt-3 line-clamp-2 text-sm font-semibold">
                        {m.Title}
                      </h3>
                      <div className="mt-1 flex flex-wrap items-center gap-2 text-xs text-slate-600">
                        <Badge>{m.Year || "N/D"}</Badge>
                        {m.Type ? <Badge>{m.Type}</Badge> : null}
                        {m.Ubication ? <Badge>{m.Ubication}</Badge> : null}
                      </div>
                      <div className="mt-3 flex items-center gap-2">
                        <button
                          onClick={() => setSelected(m)}
                          className="flex-1 rounded-lg border px-3 py-1.5 text-sm font-medium hover:bg-slate-50"
                        >
                          Detalles
                        </button>
                        <button
                          onClick={() => {
                            setEditorModel(m);
                            setEditingId(m.imdbID);
                            setShowEditor(true);
                          }}
                          className="rounded-lg bg-amber-500 px-3 py-1.5 text-sm font-medium text-white hover:bg-amber-600"
                        >
                          Editar
                        </button>
                      </div>
                    </article>
                  ))}
                </div>

                {/* Paginacion */}
                <div className="mt-6 flex items-center justify-between">
                  <button
                    disabled={page === 1}
                    onClick={() => setPage((p) => Math.max(1, p - 1))}
                    className="rounded-lg border px-3 py-1.5 text-sm disabled:opacity-40"
                  >
                    Anterior
                  </button>
                  <span className="text-sm">
                    Página {page} de{" "}
                    {Math.max(1, Math.ceil(filtered.length / pageSize))}
                  </span>
                  <button
                    disabled={page >= Math.ceil(filtered.length / pageSize)}
                    onClick={() => setPage((p) => p + 1)}
                    className="rounded-lg border px-3 py-1.5 text-sm disabled:opacity-40"
                  >
                    Siguiente
                  </button>
                </div>
              </>
            )}

            {/* Detalle Modal */}
            <Modal
              open={!!selected}
              onClose={() => setSelected(null)}
              title={selected?.Title || "Detalles"}
            >
              {selected && (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="md:col-span-1">
                    <img
                      src={selected.Poster || posterFallback}
                      onError={(e) => {
                        e.currentTarget.src = posterFallback;
                      }}
                      className="w-full rounded-xl"
                      alt={selected.Title}
                    />
                  </div>
                  <div className="md:col-span-2">
                    <div className="flex flex-wrap items-center gap-2 mb-2">
                      <Badge>imdbID: {selected.imdbID}</Badge>
                      {selected.Year && <Badge>Año: {selected.Year}</Badge>}
                      {selected.Type && <Badge>Tipo: {selected.Type}</Badge>}
                      {selected.Ubication && (
                        <Badge>Cine: {selected.Ubication}</Badge>
                      )}
                    </div>
                    <p className="text-sm leading-relaxed whitespace-pre-wrap">
                      {selected.description || "Sin descripción"}
                    </p>
                    <div className="mt-4 flex items-center gap-2">
                      <button
                        onClick={() => {
                          setEditorModel(selected);
                          setShowEditor(true);
                        }}
                        className="rounded-lg bg-amber-500 px-4 py-2 text-white hover:bg-amber-600"
                      >
                        Editar
                      </button>
                      <button
                        onClick={() => onDelete(selected.imdbID)}
                        className="rounded-lg bg-rose-600 px-4 py-2 text-white hover:bg-rose-700"
                      >
                        Eliminar
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </Modal>

            {/* Editor Modal */}
            <Modal
              open={showEditor}
              onClose={() => setShowEditor(false)}
              title={editorModel?.imdbID ? "Editar película" : "Nueva película"}
              footer={[
                <button
                  key="cancel"
                  onClick={() => setShowEditor(false)}
                  className="rounded-lg border px-4 py-2"
                >
                  Cancelar
                </button>,
                editingId ? (
                  <button
                    key="save"
                    onClick={onUpdate}
                    className="rounded-lg bg-indigo-600 px-4 py-2 text-white"
                  >
                    Guardar
                  </button>
                ) : (
                  <button
                    key="create"
                    onClick={onCreate}
                    className="rounded-lg bg-emerald-600 px-4 py-2 text-white"
                  >
                    Crear
                  </button>
                ),
              ]}
            >
              <MovieForm
                value={editorModel}
                onChange={setEditorModel}
                readOnlyId={!!editingId}
              />
            </Modal>

            <Toast show={toast.show} tone={toast.tone} text={toast.text} />

            {/* Footer */}
            <footer className="mt-10 text-center text-xs text-slate-500">
              <p>Cinema - Odalis Mariandré Arana Marroquín</p>
            </footer>
          </div>
        );
      }

      const root = ReactDOM.createRoot(document.getElementById("root"));
      root.render(<App />);