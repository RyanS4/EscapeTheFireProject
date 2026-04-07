import React, { useState } from 'react';
import { View, Image, TouchableOpacity, Text, StyleSheet, Dimensions } from 'react-native';

// Floor images - add secondFloorView.png and thirdFloorView.png when available
const floorImages: { [key: number]: any } = {
    1: require('../assets/firstFloorView.png'),
    // 2: require('../assets/secondFloorView.png'),
    // 3: require('../assets/thirdFloorView.png'),
};

// Room definitions for each floor
// Coordinates are percentages of image dimensions (0-100)
interface RoomArea {
    id: string;
    name: string;
    type: 'room' | 'hall' | 'stairwell';
    // Position as percentage of image (0-100)
    x: number;      // left position %
    y: number;      // top position %
    width: number;  // width %
    height: number; // height %
    // For stairwells - links to corresponding stairwell on other floors
    stairwellGroup?: string; // e.g., 'A', 'B', 'C' - same letter = connected stairwells
}

// Stairwell groups - selecting one highlights all in the same group across floors
const STAIRWELL_GROUPS = {
    'A': ['stair-A-1', 'stair-A-2', 'stair-A-3'], // Top stairwell
    'B': ['stair-B-1', 'stair-B-2', 'stair-B-3'], // Middle stairwell
    'C': ['stair-C-1', 'stair-C-2', 'stair-C-3'], // Bottom stairwell
};

// Room coordinates calibrated to the floor plan image
// Values are percentages (0-100) - adjust if image changes
const roomsByFloor: { [key: number]: RoomArea[] } = {
    1: [
        // Far left wing rooms
        { id: 'room-2', name: 'Room 2', type: 'room', x: 26.4, y: 38.5, width: 3.5, height: 18 },
        { id: 'room-4', name: 'Room 4', type: 'room', x: 30, y: 38.5, width: 5, height: 11 },
        { id: 'room-7', name: 'Room 7', type: 'room', x: 1, y: 55, width: 5, height: 12 },
        
        // Main Hall (vertical)
        { id: 'hall-main', name: 'Main Hall', type: 'hall', x: 7, y: 30, width: 4, height: 42 },
        
        // Left-center rooms (vertical stack)
        { id: 'room-11', name: 'Room 11', type: 'room', x: 14, y: 22, width: 6, height: 10 },
        { id: 'room-12', name: 'Room 12', type: 'room', x: 14, y: 32, width: 6, height: 10 },
        { id: 'room-13', name: 'Room 13', type: 'room', x: 14, y: 42, width: 6, height: 10 },
        { id: 'room-14', name: 'Room 14', type: 'room', x: 14, y: 52, width: 6, height: 10 },
        { id: 'room-15', name: 'Room 15', type: 'room', x: 14, y: 62, width: 7, height: 10 },
        
        // Upper center rooms
        { id: 'room-8', name: 'Room 8', type: 'room', x: 24, y: 5, width: 6, height: 12 },
        { id: 'room-9', name: 'Room 9', type: 'room', x: 24, y: 17, width: 6, height: 10 },
        { id: 'room-10', name: 'Room 10', type: 'room', x: 33, y: 5, width: 10, height: 18 },
        
        // Center Hall (horizontal)
        { id: 'hall-center', name: 'Center Hall', type: 'hall', x: 28, y: 25, width: 25, height: 4 },
        
        // Upper right area
        { id: 'room-16', name: 'Room 16', type: 'room', x: 56, y: 5, width: 6, height: 10 },
        { id: 'room-17', name: 'Room 17', type: 'room', x: 56, y: 15, width: 6, height: 10 },
        
        // Stairwell A (red - upper right)
        { id: 'stair-A-1', name: 'Stairwell A', type: 'stairwell', stairwellGroup: 'A', x: 52, y: 10, width: 4, height: 8 },
        
        // Middle section rooms
        { id: 'room-18', name: 'Room 18', type: 'room', x: 50, y: 28, width: 5, height: 8 },
        { id: 'room-19', name: 'Room 19', type: 'room', x: 50, y: 36, width: 5, height: 8 },
        { id: 'room-20', name: 'Room 20', type: 'room', x: 57, y: 25, width: 5, height: 8 },
        { id: 'room-21', name: 'Room 21', type: 'room', x: 57, y: 33, width: 5, height: 8 },
        
        // Stairwell B (red - middle)
        { id: 'stair-B-1', name: 'Stairwell B', type: 'stairwell', stairwellGroup: 'B', x: 45, y: 28, width: 5, height: 7 },
        
        // Stairwell C (red - lower middle)
        { id: 'stair-C-1', name: 'Stairwell C', type: 'stairwell', stairwellGroup: 'C', x: 45, y: 45, width: 6, height: 10 },
        
        // Lower right wing
        { id: 'room-22', name: 'Room 22', type: 'room', x: 60, y: 45, width: 6, height: 10 },
        { id: 'room-24', name: 'Room 24', type: 'room', x: 60, y: 55, width: 6, height: 10 },
        
        // Right Hall (vertical)
        { id: 'hall-right', name: 'Right Hall', type: 'hall', x: 66, y: 42, width: 3, height: 25 },
        
        // Far right rooms
        { id: 'room-23', name: 'Room 23', type: 'room', x: 73, y: 42, width: 8, height: 10 },
        { id: 'room-25', name: 'Room 25', type: 'room', x: 73, y: 52, width: 8, height: 10 },
        
        // Far right room
        { id: 'room-27', name: 'Room 27', type: 'room', x: 90, y: 35, width: 8, height: 25 },
    ],
    2: [
        // Floor 2 - same layout with 200-series room numbers
        { id: 'room-202', name: 'Room 202', type: 'room', x: 1, y: 30, width: 6, height: 15 },
        { id: 'room-204', name: 'Room 204', type: 'room', x: 1, y: 45, width: 6, height: 15 },
        { id: 'room-207', name: 'Room 207', type: 'room', x: 1, y: 60, width: 5, height: 12 },
        { id: 'hall-main-2', name: 'Main Hall', type: 'hall', x: 7, y: 30, width: 4, height: 42 },
        { id: 'room-211', name: 'Room 211', type: 'room', x: 14, y: 22, width: 6, height: 10 },
        { id: 'room-212', name: 'Room 212', type: 'room', x: 14, y: 32, width: 6, height: 10 },
        { id: 'room-213', name: 'Room 213', type: 'room', x: 14, y: 42, width: 6, height: 10 },
        { id: 'room-214', name: 'Room 214', type: 'room', x: 14, y: 52, width: 6, height: 10 },
        { id: 'room-215', name: 'Room 215', type: 'room', x: 14, y: 62, width: 7, height: 10 },
        { id: 'stair-A-2', name: 'Stairwell A', type: 'stairwell', stairwellGroup: 'A', x: 52, y: 10, width: 4, height: 8 },
        { id: 'stair-B-2', name: 'Stairwell B', type: 'stairwell', stairwellGroup: 'B', x: 45, y: 28, width: 5, height: 7 },
        { id: 'stair-C-2', name: 'Stairwell C', type: 'stairwell', stairwellGroup: 'C', x: 45, y: 45, width: 6, height: 10 },
    ],
    3: [
        // Floor 3 - same layout with 300-series room numbers
        { id: 'room-302', name: 'Room 302', type: 'room', x: 1, y: 30, width: 6, height: 15 },
        { id: 'room-304', name: 'Room 304', type: 'room', x: 1, y: 45, width: 6, height: 15 },
        { id: 'room-307', name: 'Room 307', type: 'room', x: 1, y: 60, width: 5, height: 12 },
        { id: 'hall-main-3', name: 'Main Hall', type: 'hall', x: 7, y: 30, width: 4, height: 42 },
        { id: 'room-311', name: 'Room 311', type: 'room', x: 14, y: 22, width: 6, height: 10 },
        { id: 'room-312', name: 'Room 312', type: 'room', x: 14, y: 32, width: 6, height: 10 },
        { id: 'room-313', name: 'Room 313', type: 'room', x: 14, y: 42, width: 6, height: 10 },
        { id: 'room-314', name: 'Room 314', type: 'room', x: 14, y: 52, width: 6, height: 10 },
        { id: 'room-315', name: 'Room 315', type: 'room', x: 14, y: 62, width: 7, height: 10 },
        { id: 'stair-A-3', name: 'Stairwell A', type: 'stairwell', stairwellGroup: 'A', x: 52, y: 10, width: 4, height: 8 },
        { id: 'stair-B-3', name: 'Stairwell B', type: 'stairwell', stairwellGroup: 'B', x: 45, y: 28, width: 5, height: 7 },
        { id: 'stair-C-3', name: 'Stairwell C', type: 'stairwell', stairwellGroup: 'C', x: 45, y: 45, width: 6, height: 10 },
    ],
};

interface FloorMapProps {
    onRoomPress?: (floor: number, roomId: string, roomName: string, type: string, stairwellGroup?: string) => void;
    highlightedRooms?: string[]; // Room IDs to highlight (e.g., rooms with alerts)
    selectedStairwellGroup?: string | null; // Currently selected stairwell group
}

export default function FloorMap({ onRoomPress, highlightedRooms = [], selectedStairwellGroup = null }: FloorMapProps) {
    const [currentFloor, setCurrentFloor] = useState(1);
    const totalFloors = 3;

    const goToPrevFloor = () => {
        setCurrentFloor(prev => (prev > 1 ? prev - 1 : totalFloors));
    };

    const goToNextFloor = () => {
        setCurrentFloor(prev => (prev < totalFloors ? prev + 1 : 1));
    };

    const handleRoomPress = (room: RoomArea) => {
        if (onRoomPress) {
            onRoomPress(currentFloor, room.id, room.name, room.type, room.stairwellGroup);
        }
    };

    const getFloorLabel = (floor: number) => {
        switch (floor) {
            case 1: return '1st Floor';
            case 2: return '2nd Floor';
            case 3: return '3rd Floor';
            default: return `Floor ${floor}`;
        }
    };

    // Check if a room should be highlighted (stairwell in selected group)
    const isStairwellSelected = (room: RoomArea) => {
        if (!selectedStairwellGroup || room.type !== 'stairwell') return false;
        return room.stairwellGroup === selectedStairwellGroup;
    };

    const currentRooms = roomsByFloor[currentFloor] || [];
    const hasFloorImage = floorImages[currentFloor] !== undefined;

    return (
        <View style={styles.container}>
            {/* Floor selector header */}
            <View style={styles.header}>
                <TouchableOpacity onPress={goToPrevFloor} style={styles.arrowButton}>
                    <Text style={styles.arrowText}>◀</Text>
                </TouchableOpacity>
                
                <Text style={styles.floorLabel}>{getFloorLabel(currentFloor)}</Text>
                
                <TouchableOpacity onPress={goToNextFloor} style={styles.arrowButton}>
                    <Text style={styles.arrowText}>▶</Text>
                </TouchableOpacity>
            </View>

            {/* Floor map image with clickable rooms */}
            <View style={styles.mapContainer}>
                {hasFloorImage ? (
                    <Image
                        source={floorImages[currentFloor]}
                        style={styles.mapImage}
                        resizeMode="contain"
                    />
                ) : (
                    <View style={styles.placeholderMap}>
                        <Text style={styles.placeholderText}>
                            {getFloorLabel(currentFloor)} image not available
                        </Text>
                        <Text style={styles.placeholderSubtext}>
                            Add {currentFloor === 2 ? 'secondFloorView.png' : 'thirdFloorView.png'} to assets/
                        </Text>
                    </View>
                )}

                {/* Clickable room overlays */}
                {currentRooms.map(room => {
                    const isHighlighted = highlightedRooms.includes(room.id);
                    const isStairSelected = isStairwellSelected(room);
                    return (
                        <TouchableOpacity
                            key={room.id}
                            style={[
                                styles.roomOverlay,
                                room.type === 'stairwell' && styles.stairwellOverlay,
                                room.type === 'hall' && styles.hallOverlay,
                                isHighlighted && styles.roomHighlighted,
                                isStairSelected && styles.stairwellSelected,
                                {
                                    left: `${room.x}%` as any,
                                    top: `${room.y}%` as any,
                                    width: `${room.width}%` as any,
                                    height: `${room.height}%` as any,
                                },
                            ]}
                            onPress={() => handleRoomPress(room)}
                            activeOpacity={0.7}
                        >
                            <Text style={[
                                styles.roomLabel,
                                room.type === 'stairwell' && styles.stairwellLabel,
                                room.type === 'hall' && styles.hallLabel,
                                isHighlighted && styles.roomLabelHighlighted,
                                isStairSelected && styles.stairwellLabelSelected,
                            ]} numberOfLines={1} adjustsFontSizeToFit>
                                {room.name}
                            </Text>
                        </TouchableOpacity>
                    );
                })}
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        width: '100%',
        backgroundColor: '#f5f5f5',
        borderRadius: 8,
        overflow: 'hidden',
        borderWidth: 1,
        borderColor: '#ccc',
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        backgroundColor: '#2196f3',
        paddingVertical: 10,
        paddingHorizontal: 16,
    },
    arrowButton: {
        padding: 8,
        backgroundColor: 'rgba(255,255,255,0.2)',
        borderRadius: 4,
    },
    arrowText: {
        color: '#fff',
        fontSize: 18,
        fontWeight: 'bold',
    },
    floorLabel: {
        color: '#fff',
        fontSize: 18,
        fontWeight: 'bold',
    },
    mapContainer: {
        position: 'relative',
        width: '100%',
        height: Dimensions.get('window').height * 0.3, // 30% of screen height
        backgroundColor: '#e0e0e0',
    },
    mapImage: {
        width: '100%',
        height: '100%',
    },
    placeholderMap: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#ddd',
    },
    placeholderText: {
        fontSize: 16,
        color: '#666',
        fontWeight: '600',
    },
    placeholderSubtext: {
        fontSize: 12,
        color: '#999',
        marginTop: 4,
    },
    roomOverlay: {
        position: 'absolute',
        backgroundColor: 'rgba(33, 150, 243, 0.25)',
        borderWidth: 1,
        borderColor: 'rgba(33, 150, 243, 0.5)',
        borderRadius: 2,
        justifyContent: 'center',
        alignItems: 'center',
    },
    hallOverlay: {
        backgroundColor: 'rgba(76, 175, 80, 0.2)',
        borderColor: 'rgba(76, 175, 80, 0.5)',
    },
    stairwellOverlay: {
        backgroundColor: 'rgba(244, 67, 54, 0.4)',
        borderColor: '#f44336',
        borderWidth: 2,
    },
    stairwellSelected: {
        backgroundColor: 'rgba(244, 67, 54, 0.7)',
        borderColor: '#b71c1c',
        borderWidth: 3,
    },
    roomHighlighted: {
        backgroundColor: 'rgba(255, 152, 0, 0.5)',
        borderColor: '#ff9800',
        borderWidth: 2,
    },
    roomLabel: {
        color: '#1565c0',
        fontSize: 8,
        fontWeight: 'bold',
        textAlign: 'center',
        backgroundColor: 'rgba(255,255,255,0.85)',
        paddingHorizontal: 2,
        paddingVertical: 1,
        borderRadius: 2,
    },
    hallLabel: {
        color: '#2e7d32',
        fontSize: 7,
    },
    stairwellLabel: {
        color: '#c62828',
        fontSize: 7,
        backgroundColor: 'rgba(255,255,255,0.9)',
    },
    stairwellLabelSelected: {
        color: '#fff',
        backgroundColor: 'rgba(183, 28, 28, 0.9)',
    },
    roomLabelHighlighted: {
        color: '#e65100',
        backgroundColor: 'rgba(255,255,255,0.95)',
    },
});
