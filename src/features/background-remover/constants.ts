
export const SOLID_COLORS = [
    '#ffffff', '#000000', '#f3f4f6', '#e5e7eb', '#d1d5db',
    '#ef4444', '#f97316', '#f59e0b', '#84cc16', '#22c55e',
    '#10b981', '#14b8a6', '#06b6d4', '#0ea5e9', '#3b82f6',
    '#6366f1', '#8b5cf6', '#d946ef', '#ec4899', '#f43f5e'
];

export interface Gradient {
    id: string
    css: string
    type: 'linear' | 'radial'
    stops: string[] // Colors
    direction: 'horizontal' | 'vertical' | 'diagonal-br' | 'diagonal-bl'
}

export const GRADIENTS: Gradient[] = [
    { id: '1', css: 'linear-gradient(to right, #ff7e5f, #feb47b)', type: 'linear', stops: ['#ff7e5f', '#feb47b'], direction: 'horizontal' },
    { id: '2', css: 'linear-gradient(to right, #6a11cb, #2575fc)', type: 'linear', stops: ['#6a11cb', '#2575fc'], direction: 'horizontal' },
    { id: '3', css: 'linear-gradient(to bottom, #ff9966, #ff5e62)', type: 'linear', stops: ['#ff9966', '#ff5e62'], direction: 'vertical' },
    { id: '4', css: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)', type: 'linear', stops: ['#f093fb', '#f5576c'], direction: 'diagonal-br' },
    { id: '5', css: 'linear-gradient(135deg, #84fab0 0%, #8fd3f4 100%)', type: 'linear', stops: ['#84fab0', '#8fd3f4'], direction: 'diagonal-br' },
    { id: '6', css: 'linear-gradient(to top, #cfd9df 0%, #e2ebf0 100%)', type: 'linear', stops: ['#cfd9df', '#e2ebf0'], direction: 'vertical' },
    { id: '7', css: 'linear-gradient(to top, #30cfd0 0%, #330867 100%)', type: 'linear', stops: ['#30cfd0', '#330867'], direction: 'vertical' },
    { id: '8', css: 'linear-gradient(to right, #4facfe 0%, #00f2fe 100%)', type: 'linear', stops: ['#4facfe', '#00f2fe'], direction: 'horizontal' },
    { id: '9', css: 'linear-gradient(to right, #43e97b 0%, #38f9d7 100%)', type: 'linear', stops: ['#43e97b', '#38f9d7'], direction: 'horizontal' },
    { id: '10', css: 'linear-gradient(to right, #fa709a 0%, #fee140 100%)', type: 'linear', stops: ['#fa709a', '#fee140'], direction: 'horizontal' }
];

export const IMAGE_TEMPLATES = [
    { id: 'nature1', url: 'https://images.unsplash.com/photo-1501854140884-074cf2b2c75d?w=800&q=80', label: 'Nature' },
    { id: 'office1', url: 'https://images.unsplash.com/photo-1497366216548-37526070297c?w=800&q=80', label: 'Office' },
    { id: 'studio1', url: 'https://images.unsplash.com/photo-1550684848-fac1c5b4e853?w=800&q=80', label: 'Studio' },
    { id: 'wall1', url: 'https://images.unsplash.com/photo-1533090161767-e6ffed986c88?w=800&q=80', label: 'White Wall' },
    { id: 'wood1', url: 'https://images.unsplash.com/photo-1516054575922-f0b8eeadec1a?w=800&q=80', label: 'Wood' },
    { id: 'beach1', url: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=800&q=80', label: 'Beach' },
    { id: 'city1', url: 'https://images.unsplash.com/photo-1477959858617-67f85cf4f1df?w=800&q=80', label: 'City' },
    { id: 'abstract1', url: 'https://images.unsplash.com/photo-1550684848-86a5d8727436?w=800&q=80', label: 'Abstract' },
];
