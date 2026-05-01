import { useEffect, useMemo, useState } from "react";
import {
  Building2,
  Plus,
  SearchX,
  X,
} from "lucide-react";
import { createRoom, deleteRoom, getRooms, updateRoomStatus, uploadRoomImages, getRoomImages, deleteRoomImage } from "@/services/roomApi";
import { useAuth } from "@/context/AuthContext";
import ConfirmDialog from "@/components/ConfirmDialog";
import CreateRoomForm from "@/components/room/CreateRoomForm";
import RoomCard from "@/components/room/RoomCard";
import RoomFilterBar from "@/components/room/RoomFilterBar";
import RoomStatusSummary from "@/components/room/RoomStatusSummary";
import {
  btnAccent,
  errorBanner,
  pageSubtitle,
  pageTitle,
} from "@/utils/cls";

const DEFAULT_FILTERS = { status: "", type: "", floor: "", search: "" };

export default function RoomManagement() {
  const { user } = useAuth();
  const [rooms, setRooms] = useState([]);
  const [filters, setFilters] = useState(DEFAULT_FILTERS);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [showCreate, setShowCreate] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState(null);

  const [selectedRoomId, setSelectedRoomId] = useState(null);
  const [selectedRoom, setSelectedRoom] = useState(null);
  const [showUpload, setShowUpload] = useState(false);
  const [files, setFiles] = useState([]);
  const [images, setImages] = useState([]);

  const handleAddImage = async (room) => {
    setSelectedRoom(room);
    setShowUpload(true);

    try {
      const res = await getRoomImages(room.id);
      setImages(res.data.images || []);
    } catch (err) {
      console.error(err);
    }
  };

  const showError = (err) => {
    const data = err.response?.data;
    let msg = data?.message || err.message || "Đã có lỗi xảy ra";
    if (data?.validationErrors) {
      const details = Object.values(data.validationErrors).join(", ");
      msg = `${msg}: ${details}`;
    }
    setError(msg);
    setTimeout(() => setError(""), 5000);
  };

  const fetchRooms = async () => {
    setLoading(true);
    setError("");
    try {
      const res = await getRooms(user?.hotelId, filters.status || undefined);
      setRooms(res.data);
    } catch (err) {
      showError(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRooms();
  }, [filters.status]);

  const handleFilterChange = (key, value) => {
    if (key === "reset") {
      setFilters(DEFAULT_FILTERS);
    } else {
      setFilters((prev) => ({ ...prev, [key]: value }));
    }
  };

  const filteredRooms = useMemo(() => {
    return rooms.filter((r) => {
      if (filters.status && r.status !== filters.status) return false;
      if (filters.type && r.roomTypeName !== filters.type) return false;
      if (filters.floor) {
        const roomFloor = String(Math.floor(parseInt(r.roomNumber) / 100));
        if (roomFloor !== filters.floor) return false;
      }
      if (filters.search && !r.roomNumber.includes(filters.search.trim())) return false;
      return true;
    });
  }, [rooms, filters]);

  const groupedFloors = useMemo(() => {
    const groups = {};
    filteredRooms.forEach((room) => {
      const floor = String(Math.floor(parseInt(room.roomNumber) / 100));
      if (!groups[floor]) groups[floor] = [];
      groups[floor].push(room);
    });
    return Object.entries(groups).sort(([a], [b]) => Number(a) - Number(b));
  }, [filteredRooms]);

  const handleCreate = async (formData) => {
    try {
      await createRoom(formData);
      setShowCreate(false);
      fetchRooms();
    } catch (err) {
      showError(err);
    }
  };

  const handleStatusChange = async (roomId, newStatus) => {
    try {
      await updateRoomStatus(roomId, newStatus);
      fetchRooms();
    } catch (err) {
      showError(err);
    }
  };

  const confirmDelete = async () => {
    try {
      await deleteRoom(deleteConfirm);
      fetchRooms();
    } catch (err) {
      showError(err);
    } finally {
      setDeleteConfirm(null);
    }
  };

  return (
    <>
      <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className={pageTitle}>Quản lý phòng</h1>
          <p className={`${pageSubtitle} mt-1`}>
            Theo dõi trạng thái phòng và quản lý sơ đồ tầng theo cùng một hệ màu.
          </p>
        </div>

        <button className={btnAccent} onClick={() => setShowCreate(!showCreate)}>
          <Plus
            className="h-4 w-4 transition-transform duration-200"
            style={{ transform: showCreate ? "rotate(45deg)" : "none" }}
          />
          {showCreate ? "Đóng" : "Thêm phòng"}
        </button>
      </div>

      <div className="space-y-5">
        {error && (
          <div className={`${errorBanner} flex items-center justify-between gap-3 animate-fadein`}>
            <span className="font-medium">{error}</span>
            <button
              className="text-danger transition-colors hover:text-danger/80"
              onClick={() => setError("")}
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        )}

        <RoomStatusSummary rooms={rooms} />
        <RoomFilterBar filters={filters} onChange={handleFilterChange} rooms={rooms} />

        <div
          className="grid transition-all duration-300 ease-in-out"
          style={{
            gridTemplateRows: showCreate ? "1fr" : "0fr",
            opacity: showCreate ? 1 : 0,
          }}
        >
          <div className="overflow-hidden">
            <CreateRoomForm
              onSubmit={handleCreate}
              onCancel={() => setShowCreate(false)}
            />
          </div>
        </div>

        {!loading && rooms.length > 0 && (
          <p className="text-xs text-muted">
            Hiển thị <span className="font-semibold text-dim">{filteredRooms.length}</span> /{" "}
            {rooms.length} phòng
          </p>
        )}

        {loading ? (
          <div className="flex items-center justify-center py-20">
            <div className="h-8 w-8 rounded-full border-[3px] border-accent/25 border-t-accent animate-spin" />
            <span className="ml-3 text-sm text-muted">Đang tải dữ liệu phòng...</span>
          </div>
        ) : rooms.length === 0 ? (
          <div className="rounded-2xl border border-edge bg-card px-6 py-20 text-center animate-fadein">
            <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-accent-soft/55 text-accent">
              <Building2 className="h-8 w-8" />
            </div>
            <p className="font-semibold text-dim">Chưa có phòng nào</p>
            <p className="mt-1 text-sm text-muted">Bấm "Thêm phòng" để bắt đầu.</p>
          </div>
        ) : filteredRooms.length === 0 ? (
          <div className="rounded-2xl border border-edge bg-card px-6 py-16 text-center">
            <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-raised text-ghost">
              <SearchX className="h-7 w-7" />
            </div>
            <p className="font-semibold text-dim">Không có phòng nào khớp bộ lọc</p>
            <button
              className="mt-3 text-sm font-medium text-accent underline-offset-4 transition hover:underline"
              onClick={() => setFilters(DEFAULT_FILTERS)}
            >
              Xóa bộ lọc
            </button>
          </div>
        ) : (
          <div className="space-y-6">
            {groupedFloors.map(([floor, floorRooms]) => (
              <div key={floor}>
                <h2 className="mb-3 flex items-center gap-2 text-sm font-semibold uppercase tracking-[0.18em] text-muted">
                  <Building2 className="h-4 w-4 text-accent" />
                  Tầng {floor}
                  <span className="font-normal normal-case tracking-normal text-ghost">
                    ({floorRooms.length} phòng)
                  </span>
                </h2>
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4">
                  {floorRooms.map((room, index) => (
                    <div
                      key={room.id}
                      className="animate-fadein"
                      style={{ animationDelay: `${index * 60}ms` }}
                    >
                      <RoomCard
                        room={room}
                        onStatusChange={handleStatusChange}
                        onDelete={setDeleteConfirm}
                        onAddImage={handleAddImage}
                      />
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {showUpload && (
        <div className="fixed inset-0  flex items-center justify-center z-50">
          <div className="bg-zinc-900 text-zinc-50 p-6 rounded-xl w-[420px] border border-zinc-700">
            {images.length > 0 && (
              <div className="mt-4">
                <p className="text-lg font-semibold mb-2">Ảnh hiện tại</p>

                <div className="grid grid-cols-3 gap-2">
                  {images.map((img) => (
                    <div key={img.id} className="relative group">
                      <img
                        src={img.url}
                        alt=""
                        className="h-20 w-full object-cover rounded border border-zinc-700"
                      />

                      {/* nút xoá */}
                      <button
                        onClick={async () => {
                          if (!confirm("Xóa ảnh này?")) return;

                          try {
                            await deleteRoomImage(selectedRoom.id, img.id);

                            // cập nhật UI ngay
                            setImages((prev) =>
                              prev.filter((i) => i.id !== img.id)
                            );
                          } catch (err) {
                            console.error(err);
                            alert("Xóa thất bại");
                          }
                        }}
                        className="absolute top-1 right-1 bg-black/60 text-white text-xs px-1 rounded opacity-0 group-hover:opacity-100"
                      >
                        ✕
                      </button>

                      {/* ảnh chính */}
                      {img.isPrimary && (
                        <span className="absolute bottom-1 left-1 text-[10px] bg-yellow-500 text-black px-1 rounded">
                          Chính
                        </span>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            <h3 className="text-lg font-semibold mb-4">
              Upload ảnh phòng #{selectedRoom.roomNumber}
            </h3>

            <input
              type="file"
              multiple
              accept="image/*"
              onChange={(e) => {
                const list = Array.from(e.target.files);

                if (list.length > 10) {
                  alert("Tối đa 10 ảnh");
                  return;
                }

                setFiles(list);
              }}
            />

            {/* Preview */}
            {files.length > 0 && (
              <div className="grid grid-cols-3 gap-2 mt-3">
                {files.map((file, i) => (
                  <img
                    key={i}
                    src={URL.createObjectURL(file)}
                    alt=""
                    className="h-20 w-full object-cover rounded"
                  />
                ))}
              </div>
            )}

            <div className="flex gap-2 mt-5">
              <button
                onClick={async () => {
                  try {
                    await uploadRoomImages(selectedRoom.id, files);
                    setShowUpload(false);
                    setFiles([]);
                  } catch (err) {
                    console.error(err);
                    alert("Upload thất bại");
                  }
                }}
                className="px-4 py-2 bg-yellow-500 rounded"
              >
                Upload
              </button>

              <button
                onClick={() => {
                  setShowUpload(false);
                  setFiles([]);
                }}
                className="px-4 py-2 border border-zinc-600 rounded"
              >
                Hủy
              </button>
            </div>
          </div>
        </div>
      )}

      <ConfirmDialog
        open={deleteConfirm !== null}
        title="Xóa phòng"
        message="Bạn có chắc muốn xóa phòng này? Hành động không thể hoàn tác."
        variant="danger"
        onConfirm={confirmDelete}
        onCancel={() => setDeleteConfirm(null)}
      />

    </>
  );
}
