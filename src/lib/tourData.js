import { 
  pickupTours, 
  recommendedTours, 
  topRatedTours, 
  leisureTours,
  lastMinuteDeals 
} from "@/components/homepage/data";

/**
 * Get all tours from all categories
 */
export function getAllTours() {
  return [
    ...pickupTours,
    ...recommendedTours,
    ...topRatedTours,
    ...leisureTours,
    ...lastMinuteDeals,
  ];
}

/**
 * Find a tour by title
 */
export function getTourByTitle(title) {
  const allTours = getAllTours();
  return allTours.find(tour => tour.title === title);
}
