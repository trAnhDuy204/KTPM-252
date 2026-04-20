import React from "react";
import {useEffect,useState} from 'react';

function HotelRoomsDisplay()
{
  //State var must be put in a commponet so you make a big app to hold all of this.
  //Only staterize var that related to UI.
    /*const [Room,setRoom]=React.useState([
    { id: 101, price: 80, type: "single" },
    { id: 102, price: 50, type: "single" },
    { id: 201, price: 120, type: "suite" },
    { id: 203, price: 67, type: "suite" }
  ]);*/
  //Dropdown need a separet state var not usign the array.
  const [rooms, setRooms] = useState([]);
  useEffect(() => {
    fetch("http://localhost:8080/api/public/rooms?hotelId=1")
      .then(response => response.json())
      .then(data => {
        setRooms(data);
        console.log(data);
      })
      .catch(error => console.log("Error:", error));
  }, []);
  const [roomType, setRoomType] = React.useState("all");
  function AscDesc(order)
  {
    if(order==="asc")
    {
      setRooms([...rooms].sort((a,b)=>parseFloat(a.basePrice) - parseFloat(b.basePrice)));  //<--setRoom([...Room,setRoom].....) is wrong cuz it will start adding emtpy data on screen.
    }
    if(order==="desc")
    {
      setRooms([...rooms].sort((a,b)=>parseFloat(b.basePrice) - parseFloat(a.basePrice)));
    }

  }
  function FilterButtons()
  {
    return <div>
      <button  onClick={() => AscDesc("asc")}>Giá tăng dần</button>
      <button  onClick={() => AscDesc("desc")}>Giá giảm dần</button>
    </div>
  }
  function ShowRoom() 
  {
    const filteredRooms = roomType === "all" ? rooms: rooms.filter(r => r.roomTypeName.toLowerCase() === roomType);

    return (
      <div>
        {filteredRooms.map(room => (
          <div key={room.id}>
            {room.roomNumber} - {room.roomTypeName} -  {room.status} - ${room.basePrice}
          </div>
        ))}
      </div>
    );
  }
  function SelectRoomType()
  { 
    return (
      <div>
        <select 
        value={roomType} 
        onChange={e => setRoomType(e.target.value)} 
        >
          <option value="all" >all</option>
          <option value="single">Single</option>
          <option value="suite">Suite</option>
          <option value="luxury">Luxury</option>
        </select>
      </div>
    );
  }

  return (
  <div style={{ marginTop: "60px", padding: "20px" }}>
    
    <SelectRoomType />
    <FilterButtons />
    <ShowRoom />
  </div>
);
}
export default HotelRoomsDisplay;