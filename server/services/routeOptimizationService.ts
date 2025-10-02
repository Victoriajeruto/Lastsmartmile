interface Location {
  id: string;
  boxId: string;
  location: string;
  latitude: string;
  longitude: string;
  deliveryId: string;
  trackingNumber: string;
  priority: string;
  packageType: string;
}

function calculateDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371;
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a = 
    Math.sin(dLat/2) * Math.sin(dLat/2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
    Math.sin(dLon/2) * Math.sin(dLon/2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
  return R * c;
}

function getPriorityScore(priority: string): number {
  switch (priority) {
    case "urgent": return 3;
    case "express": return 2;
    case "normal": return 1;
    default: return 1;
  }
}

function isValidCoordinate(lat: string, lon: string): boolean {
  const latNum = parseFloat(lat);
  const lonNum = parseFloat(lon);
  return !isNaN(latNum) && !isNaN(lonNum) && latNum >= -90 && latNum <= 90 && lonNum >= -180 && lonNum <= 180;
}

export function optimizeRoute(deliveries: Location[], startLat: number = -1.2921, startLon: number = 36.8219): Location[] {
  const validDeliveries = deliveries.filter(d => isValidCoordinate(d.latitude, d.longitude));
  
  if (validDeliveries.length === 0) return [];
  if (validDeliveries.length === 1) return validDeliveries;

  const optimized: Location[] = [];
  const unvisited = [...validDeliveries];
  
  unvisited.sort((a, b) => {
    const priorityDiff = getPriorityScore(b.priority) - getPriorityScore(a.priority);
    if (priorityDiff !== 0) return priorityDiff;
    
    const distA = calculateDistance(startLat, startLon, parseFloat(a.latitude), parseFloat(a.longitude));
    const distB = calculateDistance(startLat, startLon, parseFloat(b.latitude), parseFloat(b.longitude));
    return distA - distB;
  });

  let currentLat = startLat;
  let currentLon = startLon;

  while (unvisited.length > 0) {
    let nearestIndex = 0;
    let nearestDistance = Infinity;
    let highestPriorityScore = -1;

    for (let i = 0; i < unvisited.length; i++) {
      const delivery = unvisited[i];
      const priorityScore = getPriorityScore(delivery.priority);
      const distance = calculateDistance(
        currentLat,
        currentLon,
        parseFloat(delivery.latitude),
        parseFloat(delivery.longitude)
      );

      if (priorityScore > highestPriorityScore || 
          (priorityScore === highestPriorityScore && distance < nearestDistance)) {
        nearestIndex = i;
        nearestDistance = distance;
        highestPriorityScore = priorityScore;
      }
    }

    const nearest = unvisited.splice(nearestIndex, 1)[0];
    optimized.push(nearest);
    currentLat = parseFloat(nearest.latitude);
    currentLon = parseFloat(nearest.longitude);
  }

  return optimized;
}

export function calculateTotalDistance(route: Location[], startLat: number = -1.2921, startLon: number = 36.8219): number {
  if (route.length === 0) return 0;
  
  let total = calculateDistance(
    startLat,
    startLon,
    parseFloat(route[0].latitude),
    parseFloat(route[0].longitude)
  );
  
  for (let i = 1; i < route.length; i++) {
    total += calculateDistance(
      parseFloat(route[i-1].latitude),
      parseFloat(route[i-1].longitude),
      parseFloat(route[i].latitude),
      parseFloat(route[i].longitude)
    );
  }
  return total;
}

export function estimateDeliveryTime(route: Location[]): number {
  const totalDistance = calculateTotalDistance(route);
  const avgSpeedKmh = 30;
  const minutesPerStop = 5;
  const travelTimeMinutes = (totalDistance / avgSpeedKmh) * 60;
  const stopTimeMinutes = route.length * minutesPerStop;
  return Math.round(travelTimeMinutes + stopTimeMinutes);
}
