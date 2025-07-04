import React, { useEffect, useState, useRef } from "react";
import {
  SafeAreaView,
  View,
  ActivityIndicator,
  StyleSheet,
  TouchableOpacity,
  Text,
  Image,
  Modal,
} from "react-native";
import MapView, { Marker, Callout } from "react-native-maps";
import * as Location from "expo-location";
import { useRouter } from "expo-router";
import DashboardHeader from "../components/Header";
import { Footer, useFooterNavigation } from "@/components/Footer";
import { MaterialIcons } from "@expo/vector-icons";

export default function MapScreen() {
  const router = useRouter();
  const { activeTab, handleTabPress } = useFooterNavigation("map", () =>
    setSettingsModalVisible(true)
  );

  const [locations, setLocations] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [gettingLocation, setGettingLocation] = useState(false);
  const [settingsModalVisible, setSettingsModalVisible] = useState(false);
  const userMarkerRef = useRef<any>(null);



  // ✅ Controlled region state
  const [mapRegion, setMapRegion] = useState({
    latitude: 37.78825,
    longitude: -122.4324,
    latitudeDelta: 0.01,
    longitudeDelta: 0.01,
  });

  const staticLocations = [
    {
      location_id: "loc1",
      user_id: "user1",
      name: "Central Hospital",
      type: "hospital",
      latitude: 37.78825,
      longitude: -122.4324,
      description: "Main city hospital",
    },
    {
      location_id: "loc2",
      user_id: "user2",
      name: "Community Clinic",
      type: "clinic",
      latitude: 37.789,
      longitude: -122.431,
      description: "Small clinic",
    },
    {
      location_id: "loc3",
      user_id: "user3",
      name: "Relief Center",
      type: "clinic",
      latitude: 37.7905,
      longitude: -122.4305,
      description: "Emergency relief center",
    },
  ];

  const markerIcons: { [key: string]: any } = {
    hospital: require("../assets/markers/hospital.png"),
    clinic: require("../assets/markers/clinic.png"),
    user: require("../assets/markers/user.png"),
  };

  useEffect(() => {
    const timer = setTimeout(() => {
      setLocations(staticLocations);
      setLoading(false);
    }, 1000);
    return () => clearTimeout(timer);
  }, []);

  const handleGetMyLocation = async () => {
    try {
      setGettingLocation(true);

      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== "granted") {
        alert("Permission denied");
        return;
      }

      const pos = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.Balanced,
        maximumAge: 5000,
        timeout: 5000,
      });

      const { latitude, longitude } = pos.coords;

      const newLocation = {
        location_id: `user-${Date.now()}`,
        user_id: "current_user",
        name: "My Location",
        type: "user",
        latitude,
        longitude,
        description: "This is your current location.",
      };

      setLocations((prev) => [...prev, newLocation]);

      // ✅ Update controlled region (this avoids tile blanking)
      setMapRegion({
        latitude,
        longitude,
        latitudeDelta: 0.002,
        longitudeDelta: 0.002,
      });
      setTimeout(() => {
  userMarkerRef.current?.showCallout();
}, 500);

    } catch (error) {
      console.error("❌ Error getting location:", error);
      alert("Could not get location.");
    } finally {
      setGettingLocation(false);
    }
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: "#fff" }}>
      <DashboardHeader
        title="Map"
        showSettings
        onSettingsPress={() => setSettingsModalVisible(true)}
        onBackPress={() => router.back()}
      />

      <View style={{ flex: 1 }}>
        <MapView
          style={styles.map}
          region={mapRegion} // ✅ Controlled region
        >
          {locations.map((loc) => (
            <Marker
              key={loc.location_id}
              coordinate={{
                latitude: loc.latitude,
                longitude: loc.longitude,
              }}ref={loc.type === "user" ? userMarkerRef : undefined}
            >
              <Image
                source={markerIcons[loc.type] || markerIcons["clinic"]}
                style={{ width: 32, height: 32 }}
                resizeMode="contain"
              />
              <Callout tooltip>
                <View
                  style={{
                    width: 220,
                    backgroundColor: "#fff",
                    padding: 8,
                    borderRadius: 8,
                    borderWidth: 1,
                    borderColor: "#ccc",
                  }}
                >
                  <Text
                    style={{
                      fontWeight: "bold",
                      fontSize: 14,
                      marginBottom: 4,
                    }}
                  >
                    {loc.name}
                  </Text>
                  {loc.type === "user" ? (
                    <>
                      <Text style={{ fontSize: 12 }}>
                        Lat: {loc.latitude.toFixed(5)}
                      </Text>
                      <Text style={{ fontSize: 12 }}>
                        Lng: {loc.longitude.toFixed(5)}
                      </Text>
                    </>
                  ) : (
                    <Text style={{ fontSize: 12, color: "#555" }}>
                      {loc.description}
                    </Text>
                  )}
                </View>
              </Callout>
            </Marker>
          ))}
        </MapView>

        <View style={styles.buttonContainer}>
          <TouchableOpacity
            onPress={handleGetMyLocation}
            style={[
              styles.getLocationButton,
              gettingLocation && { opacity: 0.7 },
            ]}
            disabled={gettingLocation}
          >
            {gettingLocation ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text style={styles.getLocationButtonText}>Get My Location</Text>
            )}
          </TouchableOpacity>
        </View>

        <Footer activeTab={activeTab} onTabPress={handleTabPress} />
      </View>

      {/* Settings Modal */}
      <Modal visible={settingsModalVisible} transparent animationType="fade">
        <View
          style={{
            flex: 1,
            backgroundColor: "rgba(0,0,0,0.18)",
            justifyContent: "flex-end",
          }}
        >
          <View
            style={{
              backgroundColor: "#fff",
              borderTopLeftRadius: 24,
              borderTopRightRadius: 24,
              padding: 24,
              paddingBottom: 40,
            }}
          >
            <Text
              style={{ fontSize: 18, fontWeight: "bold", marginBottom: 18 }}
            >
              Settings
            </Text>
            <TouchableOpacity
              style={{
                flexDirection: "row",
                alignItems: "center",
                paddingVertical: 12,
              }}
              onPress={() => {
                setSettingsModalVisible(false);
                router.push("/profile");
              }}
            >
              <MaterialIcons
                name="person"
                size={22}
                color="#f97316"
                style={{ marginRight: 12 }}
              />
              <Text style={{ fontSize: 16 }}>Profile</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={{
                flexDirection: "row",
                alignItems: "center",
                paddingVertical: 12,
              }}
              onPress={() => {
                setSettingsModalVisible(false);
                router.push("/preferences");
              }}
            >
              <MaterialIcons
                name="tune"
                size={22}
                color="#f97316"
                style={{ marginRight: 12 }}
              />
              <Text style={{ fontSize: 16 }}>Preferences</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={{
                flexDirection: "row",
                alignItems: "center",
                paddingVertical: 12,
              }}
            >
              <MaterialIcons
                name="logout"
                size={22}
                color="#f97316"
                style={{ marginRight: 12 }}
              />
              <Text
                style={{ fontSize: 16, fontWeight: "bold", color: "#f97316" }}
              >
                Logout
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={() => setSettingsModalVisible(false)}
              style={{ alignSelf: "center", marginTop: 18 }}
            >
              <Text
                style={{ fontSize: 16, fontWeight: "bold", color: "#f97316" }}
              >
                Close
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  map: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  buttonContainer: {
    position: "absolute",
    bottom: 80,
    left: 20,
    right: 20,
  },
  getLocationButton: {
    backgroundColor: "#f97316",
    height: 48,
    borderRadius: 8,
    justifyContent: "center",
    alignItems: "center",
    marginHorizontal: 20,
  },
  getLocationButtonText: {
    color: "#fff",
    fontWeight: "700",
    fontSize: 16,
  },
});
