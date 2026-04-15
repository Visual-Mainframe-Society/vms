export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[]

export type Database = {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string
          username: string | null
          full_name: string | null
          avatar_url: string | null
          bio: string | null
          is_artist: boolean
          is_admin: boolean
          created_at: string
        }
        Insert: {
          id: string
          username: string | null
          full_name?: string | null
          avatar_url?: string | null
          bio?: string | null
          is_artist?: boolean
          is_admin?: boolean
          created_at?: string
        }
        Update: {
          username?: string | null
          full_name?: string | null
          avatar_url?: string | null
          bio?: string | null
          is_artist?: boolean
          is_admin?: boolean
        }
      }
      artworks: {
        Row: {
          id: string
          artist_id: string
          title: string
          description: string | null
          medium: 'painting' | 'photography' | 'print' | 'sculpture' | 'digital'
          price: number
          dimensions_cm: { height: number; width: number; depth?: number } | null
          weight_kg: number | null
          is_available: boolean
          is_approved: boolean
          is_listed: boolean
          image_urls: string[]
          created_at: string
        }
        Insert: {
          id?: string
          artist_id: string
          title: string
          description?: string | null
          medium: 'painting' | 'photography' | 'print' | 'sculpture' | 'digital'
          price: number
          dimensions_cm?: { height: number; width: number; depth?: number } | null
          weight_kg?: number | null
          is_available?: boolean
          is_approved?: boolean
          is_listed?: boolean
          image_urls?: string[]
          created_at?: string
        }
        Update: {
          title?: string
          description?: string | null
          medium?: 'painting' | 'photography' | 'print' | 'sculpture' | 'digital'
          price?: number
          dimensions_cm?: { height: number; width: number; depth?: number } | null
          weight_kg?: number | null
          is_available?: boolean
          is_approved?: boolean
          is_listed?: boolean
          image_urls?: string[]
        }
      }
      upload_requests: {
        Row: {
          id: string
          artist_id: string
          title: string
          description: string | null
          medium: 'painting' | 'photography' | 'print' | 'sculpture' | 'digital'
          price: number | null
          dimensions_cm: { height: number; width: number; depth?: number } | null
          weight_kg: number | null
          image_url: string | null // ← was image_urls: string[]
          status: 'draft' | 'pending' | 'approved' | 'disapproved'
          notes: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          artist_id: string
          title: string
          description?: string | null
          medium: 'painting' | 'photography' | 'print' | 'sculpture' | 'digital'
          price?: number | null
          dimensions_cm?: { height: number; width: number; depth?: number } | null
          weight_kg?: number | null
          image_url?: string | null // ← was image_urls?: string[]
          status?: 'draft' | 'pending'
          created_at?: string
        }
        Update: {
          title?: string
          description?: string | null
          medium?: 'painting' | 'photography' | 'print' | 'sculpture' | 'digital'
          price?: number | null
          dimensions_cm?: { height: number; width: number; depth?: number } | null
          weight_kg?: number | null
          image_url?: string | null // ← was image_urls?: string[]
          status?: 'draft' | 'pending' | 'approved' | 'disapproved'
          notes?: string | null
        }
      }
      likes: {
        Row: {
          id: string
          user_id: string
          artwork_id: string
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          artwork_id: string
          created_at?: string
        }
        Update: never
      }
      follows: {
        Row: {
          id: string
          follower_id: string
          artist_id: string
          created_at: string
        }
        Insert: {
          id?: string
          follower_id: string
          artist_id: string
          created_at?: string
        }
        Update: never
      }
      cart_items: {
        Row: {
          id: string
          user_id: string
          artwork_id: string
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          artwork_id: string
          created_at?: string
        }
        Update: never
      }
      orders: {
        Row: {
          id: string
          buyer_id: string
          status: 'pending' | 'confirmed' | 'delivered' | 'completed'
          total: number
          delivery_address: {
            line1: string
            line2?: string
            city: string
            state: string
            pincode: string
          }
          payment_reference: string | null
          payment_status: 'initiated' | 'paid' | 'failed' | 'refunded'
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          buyer_id: string
          status?: 'pending' | 'confirmed' | 'delivered' | 'completed'
          total: number
          delivery_address: {
            line1: string
            line2?: string
            city: string
            state: string
            pincode: string
          }
          payment_reference?: string | null
          payment_status?: 'initiated' | 'paid' | 'failed' | 'refunded'
          created_at?: string
        }
        Update: {
          status?: 'pending' | 'confirmed' | 'delivered' | 'completed'
          payment_reference?: string | null
          payment_status?: 'initiated' | 'paid' | 'failed' | 'refunded'
        }
      }
      order_items: {
        Row: {
          id: string
          order_id: string
          artwork_id: string
          price_at_purchase: number
          commission_amount: number
        }
        Insert: {
          id?: string
          order_id: string
          artwork_id: string
          price_at_purchase: number
        }
        Update: never
      }
      comments: {
        Row: {
          id: string
          user_id: string
          artwork_id: string
          content: string
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          artwork_id: string
          content: string
          created_at?: string
        }
        Update: never
      }
    }
    Functions: {
      is_admin: {
        Args: Record<string, never>
        Returns: boolean
      }
    }
  }
}
