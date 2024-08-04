import React, { useState, useEffect } from 'react';
import axios from 'axios';

const Dashboard = () => {
  const [trains, setTrains] = useState([]);
  const [selectedTrain, setSelectedTrain] = useState(null);
  const [availableSeats, setAvailableSeats] = useState([]);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchTrains = async () => {
      try {
        const response = await axios.get('/api/trains/', {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('access_token')}`
          }
        });
        setTrains(response.data);
      } catch (error) {
        console.error('Error fetching trains:', error);
      }
    };
    fetchTrains();
  }, []);

  const handleTrainSelect = async (trainId) => {
    setSelectedTrain(trainId);
    try {
      const response = await axios.get(`/api/trains/${trainId}/seats/`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('access_token')}`
        }
      });
      setAvailableSeats(response.data.filter(seat => seat.is_available));
    } catch (error) {
      console.error('Error fetching seats:', error);
    }
  };

  const handleBooking = async (seatId) => {
    try {
      await axios.post('/api/bookings/book_seat/', {
        train_id: selectedTrain,
        seat_id: seatId
      }, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('access_token')}`
        }
      });
      alert('Seat booked successfully');
      // Refresh available seats
      handleTrainSelect(selectedTrain);
    } catch (error) {
      setError('Booking failed. Please try again.');
    }
  };

  return (
    <div>
      <h2>Dashboard</h2>
      {error && <p style={{ color: 'red' }}>{error}</p>}
      <div>
        <h3>Available Trains</h3>
        <ul>
          {trains.map(train => (
            <li key={train.id} onClick={() => handleTrainSelect(train.id)}>
              {train.name}
            </li>
          ))}
        </ul>
      </div>
      {selectedTrain && (
        <div>
          <h3>Available Seats for Train {selectedTrain}</h3>
          <ul>
            {availableSeats.map(seat => (
              <li key={seat.id}>
                Seat {seat.seat_number} - <button onClick={() => handleBooking(seat.id)}>Book</button>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
};

export default Dashboard;
