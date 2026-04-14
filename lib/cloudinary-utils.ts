export const uploadToCloudinary = async (file: File): Promise<string> => {
  const cloudName = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME;
  const uploadPreset = process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET;

  // We check for 'your_cloud_name' to ensure the user has replaced the placeholders
  if (!cloudName || !uploadPreset || cloudName === 'your_cloud_name') {
    throw new Error(
      'Cloudinary keys are missing! Please log into Cloudinary, retrieve your Cloud Name and Upload Preset, and add them to your .env.local file.'
    );
  }

  const formData = new FormData();
  formData.append('file', file);
  formData.append('upload_preset', uploadPreset);

  const response = await fetch(`https://api.cloudinary.com/v1_1/${cloudName}/image/upload`, {
    method: 'POST',
    body: formData,
  });

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.error?.message || 'Failed to upload image to Cloudinary');
  }

  const data = await response.json();
  return data.secure_url; // Standard public HTTPS URL hosted by Cloudinary
};
