export type PlaceReview = {
  authorName: string
  authorUri: string | null
  rating: number | null
  relativePublishTimeDescription: string | null
  text: string | null
  publishTime: string | null
}

export type PlaceDetails = {
  rating: number | null
  userRatingCount: number | null
  openNow: boolean | null
  weekdayDescriptions: string[]
  googleMapsUri: string | null
  reviews: PlaceReview[]
}

export type PlaceDetailsProvider = {
  get(placeId: string): Promise<PlaceDetails | null>
}

export const disabledPlaceDetailsProvider: PlaceDetailsProvider = {
  async get() {
    return null
  },
}
