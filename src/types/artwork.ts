import type { Database } from './database'

// ── Row aliases ───────────────────────────────────────────────────────────────

type ArtworkRow = Database['public']['Tables']['artworks']['Row']
type ProfileRow = Database['public']['Tables']['profiles']['Row']
type CommentRow = Database['public']['Tables']['comments']['Row']
type UploadRequestRow = Database['public']['Tables']['upload_requests']['Row']

// ── Primitives ────────────────────────────────────────────────────────────────

export type ArtworkMedium = ArtworkRow['medium']
export type Dimensions = NonNullable<ArtworkRow['dimensions_cm']>
export type OrderStatus = Database['public']['Tables']['orders']['Row']['status']
export type PaymentStatus = Database['public']['Tables']['orders']['Row']['payment_status']
export type UploadRequestStatus = UploadRequestRow['status']

// ── Profile sub-shapes ────────────────────────────────────────────────────────

export type ProfileBasic = Pick<ProfileRow, 'username' | 'avatar_url'>

// ── Comment ───────────────────────────────────────────────────────────────────

export interface ArtworkComment extends Pick<CommentRow, 'id' | 'content' | 'created_at'> {
  profiles: ProfileBasic
}

// ── Artwork shapes ────────────────────────────────────────────────────────────

/** Full detail shape — used in ArtworkDetailView + ArtworkInfoPanel */
export interface ArtworkDetail extends Pick<
  ArtworkRow,
  | 'id'
  | 'title'
  | 'description'
  | 'price'
  | 'medium'
  | 'dimensions_cm'
  | 'image_urls'
  | 'created_at'
  | 'is_available'
> {
  profiles: ProfileBasic
  comments: ArtworkComment[]
}

/** Editable shape — used in ArtworkEditView */
export type ArtworkEditable = Pick<
  ArtworkRow,
  'id' | 'title' | 'description' | 'price' | 'image_urls' | 'is_listed'
>

/** Card shape for the Explore masonry grid */
export interface ArtworkCard extends Pick<ArtworkRow, 'id' | 'title' | 'price' | 'is_available'> {
  image_urls: [string, ...string[]]
  profiles: Pick<ProfileRow, 'username'>
}

/** Panel shape — used in StudioView + PanelArtworkList */
export type PanelArtwork = Pick<
  ArtworkRow,
  'id' | 'artist_id' | 'title' | 'description' | 'price' | 'image_urls' | 'is_listed' | 'created_at'
>

// ── Upload request / submission shapes ────────────────────────────────────────

/** Full submission shape — used in ReviewQueueView + SubmissionReviewSheet */
export type Submission = Pick<
  UploadRequestRow,
  | 'id'
  | 'artist_id'
  | 'title'
  | 'description'
  | 'medium'
  | 'price'
  | 'dimensions_cm'
  | 'weight_kg'
  | 'image_url'
  | 'notes'
  | 'created_at'
>

/** Mapped shape used in Studio panels after fetching upload_requests */
export interface PanelUploadRequest {
  id: string
  title: string
  price: number | null
  image_url: string | null
  notes: string | null
  created_at: string
}

// ── Cart ──────────────────────────────────────────────────────────────────────

/** Re-exported here so cart store and components share one source */
export interface CartItem {
  artworkId: string
  title: string
  price: number
  imageUrl: string
  artistUsername: string
  isAvailable: boolean
}

// ── Draft ─────────────────────────────────────────────────────────────────────

export interface ArtworkDraft {
  id: string
  title: string
  description: string
  price: number | null
  height: number | null
  width: number | null
  depth: number | null
  imageUrl: string | null
}

// ── Panel union ───────────────────────────────────────────────────────────────

export type PanelItem = PanelArtwork | PanelUploadRequest
