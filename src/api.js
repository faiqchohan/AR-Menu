import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.SUPABASE_URL || ''
const supabaseKey = import.meta.env.SUPABASE_ANON_KEY || ''

export const supabase = createClient(
  supabaseUrl || 'https://placeholder.supabase.co', 
  supabaseKey || 'placeholder',
  {
    global: {
      fetch: (url, options) => fetch(url, { ...options, cache: 'no-store' })
    }
  }
)

/**
 * Fetch the full menu grouped by category.
 * Fetch all items: select * from menu_items
 * @returns {Promise<Record<string, Array>>}
 */
/**
 * Fetch the full menu grouped by category for a specific restaurant.
 * @returns {Promise<Record<string, Array>>}
 */
export async function fetchMenu(restaurantId) {
  if (!supabaseUrl || !supabaseKey) {
    console.warn("Supabase URL or Key is missing. Please add them to .env");
  }

  const { data, error } = await supabase
    .from('menu_items')
    .select('*')
    .eq('restaurant_id', restaurantId)
    .order('sort_order', { ascending: true })
  
  if (error) throw new Error(`Menu fetch failed: ${error.message}`)

  // Map supabase columns (model_src, ios_src) back to camelCase for the frontend
  const formattedData = (data || []).map(item => ({
    ...item,
    modelSrc: item.model_src,
    iosSrc: item.ios_src
  }))

  const menuByCategory = formattedData.reduce((acc, item) => {
    (acc[item.category] ??= []).push(item)
    return acc
  }, {})
  
  return menuByCategory
}

/**
 * Fetch by category: select * where category = 'Burgers'
 */
export async function fetchMenuByCategory(category) {
  const { data, error } = await supabase
    .from('menu_items')
    .select('*')
    .eq('category', category)
    
  if (error) throw new Error(`Fetch by category failed: ${error.message}`)
  
  return (data || []).map(item => ({
    ...item,
    modelSrc: item.model_src,
    iosSrc: item.ios_src
  }))
}

/**
 * Fetch single item: select * where id = 1
 */
export async function fetchMenuItem(id) {
  const { data, error } = await supabase
    .from('menu_items')
    .select('*')
    .eq('id', id)
    .single()
    
  if (error) throw new Error(`Fetch single item failed: ${error.message}`)
  
  return {
    ...data,
    modelSrc: data.model_src,
    iosSrc: data.ios_src
  }
}

/**
 * Fetch restaurant name, logo URL, and primary color.
 * @returns {Promise<Object>}
 */
export async function fetchRestaurant(slug) {
  if (!supabaseUrl || !supabaseKey) return null;

  const { data, error } = await supabase
    .from('restaurants')
    .select('*')
    .eq('slug', slug)
    .single()
    
  if (error) {
    if (error.code === 'PGRST116') return null; // Not found (0 rows)
    throw new Error(`Restaurant fetch failed: ${error.message}`);
  }
  
  return {
    id: data.id,
    name: data.name,
    logo: data.logo_url,
    primary_color: data.primary_color,
    theme: data.theme || {},
    layout: data.layout || 'minimal'
  }
}
