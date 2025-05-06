import { supabase } from "@/integrations/supabase/client";
import { InterviewExperience, OfferDetail } from "@/types";

interface InterviewExperienceSubmission {
  userId: string;
  companyName: string;
  description: string;
  isOnCampus: boolean;
  isProductBased: boolean;
  isAnonymous: boolean;
}

interface OfferDetailSubmission {
  userId: string;
  companyName: string;
  description: string;
  isOnCampus: boolean;
  isProductBased: boolean;
  isAnonymous: boolean;
  imageUrl?: string | null;
}

export const submitInterviewExperience = async (
  submission: InterviewExperienceSubmission
): Promise<InterviewExperience> => {
  console.log("Submitting interview experience:", submission);
  
  const { data, error } = await supabase
    .from("interview_experiences")
    .insert([
      {
        user_id: submission.userId,
        company_name: submission.companyName,
        description: submission.description,
        is_on_campus: submission.isOnCampus,
        is_product_based: submission.isProductBased,
        is_anonymous: submission.isAnonymous
      }
    ])
    .select(`
      *,
      profile:user_id (username, full_name, year, branch, avatar_url)
    `)
    .single();

  if (error) {
    console.error("Error submitting interview experience:", error);
    throw error;
  }

  if (!data) {
    console.error("No data returned from interview experience submission");
    throw new Error("Failed to submit interview experience");
  }

  // Initialize default profile value if it came back as an error or is missing
  const safeProfile = typeof data.profile === 'object' && data.profile !== null ? 
    data.profile : 
    { username: "anonymous", full_name: null, year: null, branch: null, avatar_url: null };

  // Transform the data to include both snake_case and camelCase properties
  const transformedData: InterviewExperience = {
    ...data,
    companyName: data.company_name,
    isOnCampus: data.is_on_campus,
    isProductBased: data.is_product_based,
    isAnonymous: data.is_anonymous,
    createdAt: data.created_at,
    profile: safeProfile
  };

  console.log("Successfully submitted interview experience:", transformedData);
  return transformedData;
};

export const submitOfferDetail = async (
  submission: OfferDetailSubmission
): Promise<OfferDetail> => {
  console.log("Submitting offer detail:", submission);

  const { data, error } = await supabase
    .from("offer_details")
    .insert([
      {
        user_id: submission.userId,
        company_name: submission.companyName,
        details: submission.description,
        is_on_campus: submission.isOnCampus,
        is_product_based: submission.isProductBased,
        is_anonymous: submission.isAnonymous,
        image_url: submission.imageUrl
      }
    ])
    .select(`
      *,
      profile:user_id (username, full_name, year, branch, avatar_url)
    `)
    .single();

  if (error) {
    console.error("Error submitting offer detail:", error);
    throw error;
  }

  if (!data) {
    console.error("No data returned from offer detail submission");
    throw new Error("Failed to submit offer detail");
  }

  // Initialize default profile value if it came back as an error or is missing
  const safeProfile = typeof data.profile === 'object' && data.profile !== null ? 
    data.profile : 
    { username: "anonymous", full_name: null, year: null, branch: null, avatar_url: null };

  // Transform the data to include both snake_case and camelCase properties
  const transformedData: OfferDetail = {
    ...data,
    companyName: data.company_name,
    description: data.details,
    details: data.details,
    isOnCampus: data.is_on_campus,
    isProductBased: data.is_product_based,
    isAnonymous: data.is_anonymous,
    imageUrl: data.image_url,
    createdAt: data.created_at,
    profile: safeProfile
  };

  console.log("Successfully submitted offer detail:", transformedData);
  return transformedData;
};

export const uploadOfferLetter = async (file: File, userId: string): Promise<string | null> => {
  console.log("Uploading offer letter:", file.name);
  
  const fileExt = file.name.split('.').pop();
  const fileName = `${userId}-${Date.now()}.${fileExt}`;
  const filePath = `offer-letters/${fileName}`;
  
  const { error: uploadError, data } = await supabase.storage
    .from('placements')
    .upload(filePath, file);
    
  if (uploadError) {
    console.error("Error uploading offer letter:", uploadError);
    return null;
  }
  
  const { data: { publicUrl } } = supabase.storage
    .from('placements')
    .getPublicUrl(filePath);
    
  console.log("Successfully uploaded offer letter:", publicUrl);
  return publicUrl;
};
