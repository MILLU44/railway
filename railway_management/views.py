from rest_framework import viewsets, permissions
from .models import Train, Station, Seat, Booking, UserProfile
from .serializers import TrainSerializer, StationSerializer, SeatSerializer, BookingSerializer, UserProfileSerializer
from django.contrib.auth.models import User
from rest_framework.decorators import action
from rest_framework.response import Response
from django.db import transaction

class TrainViewSet(viewsets.ModelViewSet):
    queryset = Train.objects.all()
    serializer_class = TrainSerializer
    permission_classes = [permissions.IsAuthenticated]

class StationViewSet(viewsets.ModelViewSet):
    queryset = Station.objects.all()
    serializer_class = StationSerializer
    permission_classes = [permissions.IsAuthenticated]

class SeatViewSet(viewsets.ModelViewSet):
    queryset = Seat.objects.all()
    serializer_class = SeatSerializer
    permission_classes = [permissions.IsAuthenticated]

class BookingViewSet(viewsets.ModelViewSet):
    queryset = Booking.objects.all()
    serializer_class = BookingSerializer
    permission_classes = [permissions.IsAuthenticated]

    @action(detail=False, methods=['post'])
    def book_seat(self, request):
        user = request.user
        train_id = request.data.get('train_id')
        seat_id = request.data.get('seat_id')

        with transaction.atomic():
            seat = Seat.objects.select_for_update().get(id=seat_id, train_id=train_id)
            if seat.is_available:
                seat.is_available = False
                seat.save()
                Booking.objects.create(user=user, train_id=train_id, seat_id=seat_id)
                return Response({'status': 'Seat booked successfully'})
            else:
                return Response({'status': 'Seat not available'}, status=400)

class UserProfileViewSet(viewsets.ModelViewSet):
    queryset = UserProfile.objects.all()
    serializer_class = UserProfileSerializer
    permission_classes = [permissions.IsAuthenticated]

from django.urls import path, include
from rest_framework.routers import DefaultRouter

router = DefaultRouter()
router.register(r'trains', TrainViewSet)
router.register(r'stations', StationViewSet)
router.register(r'seats', SeatViewSet)
router.register(r'bookings', BookingViewSet)
router.register(r'user_profiles', UserProfileViewSet)

urlpatterns = [
    path('api/', include(router.urls)),
]
