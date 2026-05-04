import { adminApi } from "../adminApi";
import api from "../api";

jest.mock("../api", () => ({
  get: jest.fn(),
  post: jest.fn(),
  put: jest.fn(),
  delete: jest.fn()
}));

import axios from "axios";
jest.spyOn(axios, "delete").mockImplementation(jest.fn());
jest.spyOn(axios, "post").mockImplementation(jest.fn());
jest.spyOn(axios, "put").mockImplementation(jest.fn());

describe("Room Types API", () => {
  it("getRoomTypes gọi đúng endpoint", () => {
    adminApi.getRoomTypes();
    expect(api.get).toHaveBeenCalledWith(
      "http://localhost:8080/api/admin/room-types"
    );
  });

  it("saveRoomType (create)", () => {
    const data = { name: "Deluxe" };

    adminApi.saveRoomType(data);

    expect(api.post).toHaveBeenCalledWith(
      "http://localhost:8080/api/admin/room-types",
      data
    );
  });

  it("saveRoomType (update)", () => {
    const data = { id: 1, name: "Deluxe" };

    adminApi.saveRoomType(data);

    expect(api.put).toHaveBeenCalledWith(
      "http://localhost:8080/api/admin/room-types/1",
      data
    );
  });

  it("deleteRoomType", () => {
    adminApi.deleteRoomType(5);

    expect(api.delete).toHaveBeenCalledWith(
      "http://localhost:8080/api/admin/room-types/5"
    );
  });
});

describe("Rooms API", () => {
  it("getAllRooms", () => {
    adminApi.getAllRooms();

    expect(api.get).toHaveBeenCalledWith(
      "http://localhost:8080/api/admin/rooms"
    );
  });

  it("saveRoom create", () => {
    const data = { roomNumber: "P101" };

    adminApi.saveRoom(data);

    expect(api.post).toHaveBeenCalledWith(
      "http://localhost:8080/api/admin/rooms",
      data
    );
  });

  it("saveRoom update", () => {
    const data = { id: 2, roomNumber: "P101" };

    adminApi.saveRoom(data);

    expect(api.put).toHaveBeenCalledWith(
      "http://localhost:8080/api/admin/rooms/2",
      data
    );
  });

  it("deleteRoom", () => {
    adminApi.deleteRoom(2);

    expect(api.delete).toHaveBeenCalledWith(
      "http://localhost:8080/api/admin/rooms/2"
    );
  });

  it("searchRooms", () => {
    adminApi.searchRooms("P101");

    expect(api.get).toHaveBeenCalledWith(
      "http://localhost:8080/api/admin/rooms/search?roomNumber=P101"
    );
  });
});

describe("Users API", () => {
  it("getUsers", () => {
    adminApi.getUsers();

    expect(api.get).toHaveBeenCalledWith(
      "http://localhost:8080/api/admin/users"
    );
  });

  it("saveUser create", () => {
    const data = { name: "A" };

    adminApi.saveUser(data);

    expect(api.post).toHaveBeenCalledWith(
      "http://localhost:8080/api/admin/users",
      data
    );
  });

  it("saveUser update", () => {
    const data = { id: 1, name: "A" };

    adminApi.saveUser(data);

    expect(api.put).toHaveBeenCalledWith(
      "http://localhost:8080/api/admin/users/1",
      data
    );
  });

  it("deleteUser", () => {
    adminApi.deleteUser(3);

    expect(api.delete).toHaveBeenCalledWith(
      "http://localhost:8080/api/admin/users/3"
    );
  });
});

describe("Hotels API", () => {
  it("getHotels", () => {
    adminApi.getHotels();

    expect(api.get).toHaveBeenCalledWith(
      "http://localhost:8080/api/admin/hotels"
    );
  });

  it("deleteHotel dùng axios (không phải api)", () => {
    adminApi.deleteHotel(1);

    expect(axios.delete).toHaveBeenCalledWith(
      "http://localhost:8080/api/admin/hotels/1"
    );
  });

  it("saveHotel create", () => {
    const data = { name: "Hotel A" };

    adminApi.saveHotel(data);

    expect(axios.post).toHaveBeenCalledWith(
      "http://localhost:8080/api/admin/hotels",
      data
    );
  });

  it("saveHotel update", () => {
    const data = { id: 1, name: "Hotel A" };

    adminApi.saveHotel(data);

    expect(axios.put).toHaveBeenCalledWith(
      "http://localhost:8080/api/admin/hotels/1",
      data
    );
  });
});

describe("Bookings API", () => {
  it("getBookings với params", () => {
    const params = { page: 1 };

    adminApi.getBookings(params);

    expect(api.get).toHaveBeenCalledWith(
      "http://localhost:8080/api/admin/bookings",
      { params }
    );
  });
});