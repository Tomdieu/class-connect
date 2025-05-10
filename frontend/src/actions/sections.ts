"use server";

import api from "@/services/api";
import { auth } from "@/auth";
import { AxiosError } from "axios";
import { Section,EducationLevel,Speciality,LevelClassDefinition,ClassType, LevelClassDefinitionCreate } from "@/types";


// region section
export const getSections = async () => {
    try {
        const response = await api.get("/api/sections/");
        return response.data as Section[];
    } catch (error: unknown) {
        const axiosError = error as AxiosError;
        if (axiosError.response?.data) {
            throw JSON.stringify(axiosError.response.data);
        }
        throw JSON.stringify({ message: "An unexpected error occurred" });
    }
}

export const getSection = async (id: string) => {
    try {
        const response = await api.get(`/api/sections/${id}`);
        return response.data as Section;
    } catch (error: unknown) {
        const axiosError = error as AxiosError;
        if (axiosError.response?.data) {
            throw JSON.stringify(axiosError.response.data);
        }
        throw JSON.stringify({ message: "An unexpected error occurred" });
    }
}
export const createSection = async (section: Section) => {
    try {
        const response = await api.post("/api/sections/", section);
        return response.data as Section;
    } catch (error: unknown) {
        const axiosError = error as AxiosError;
        if (axiosError.response?.data) {
            throw JSON.stringify(axiosError.response.data);
        }
        throw JSON.stringify({ message: "An unexpected error occurred" });
    }
}


export const updateSection = async (section: Section) => {
    try {
        const response = await api.put(`/api/sections/${section.id}`, section);
        return response.data as Section;
    } catch (error: unknown) {
        const axiosError = error as AxiosError;
        if (axiosError.response?.data) {
            throw JSON.stringify(axiosError.response.data);
        }
        throw JSON.stringify({ message: "An unexpected error occurred" });
    }
}
export const deleteSection = async (id: string) => {
    try {
        const response = await api.delete(`/api/sections/${id}`);
        return response.data as Section;
    } catch (error: unknown) {
        const axiosError = error as AxiosError;
        if (axiosError.response?.data) {
            throw JSON.stringify(axiosError.response.data);
        }
        throw JSON.stringify({ message: "An unexpected error occurred" });
    }
}


// endregion section

// region Education levels

export const getEducationLevels = async () => {
    try {
        const response = await api.get("/api/education-levels/");
        return response.data as EducationLevel[];
    } catch (error: unknown) {
        const axiosError = error as AxiosError;
        if (axiosError.response?.data) {
            throw JSON.stringify(axiosError.response.data);
        }
        throw JSON.stringify({ message: "An unexpected error occurred" });
    }
}

export const getEducationLevel = async (id: string) => {
    try {
        const response = await api.get(`/api/education-levels/${id}`);
        return response.data as EducationLevel;
    } catch (error: unknown) {
        const axiosError = error as AxiosError;
        if (axiosError.response?.data) {
            throw JSON.stringify(axiosError.response.data);
        }
        throw JSON.stringify({ message: "An unexpected error occurred" });
    }
}

export const createEducationLevel = async (educationLevel: EducationLevel) => {
    try {
        const response = await api.post("/api/education-levels/", educationLevel);
        return response.data as EducationLevel;
    } catch (error: unknown) {
        const axiosError = error as AxiosError;
        if (axiosError.response?.data) {
            throw JSON.stringify(axiosError.response.data);
        }
        throw JSON.stringify({ message: "An unexpected error occurred" });
    }
}

export const updateEducationLevel = async (educationLevel: EducationLevel) => {
    try {
        const response = await api.put(`/api/education-levels/${educationLevel.id}`, educationLevel);
        return response.data as EducationLevel;
    } catch (error: unknown) {
        const axiosError = error as AxiosError;
        if (axiosError.response?.data) {
            throw JSON.stringify(axiosError.response.data);
        }
        throw JSON.stringify({ message: "An unexpected error occurred" });
    }
}

export const deleteEducationLevel = async (id: string) => {
    try {
        const response = await api.delete(`/api/education-levels/${id}`);
        return response.data as EducationLevel;
    } catch (error: unknown) {
        const axiosError = error as AxiosError;
        if (axiosError.response?.data) {
            throw JSON.stringify(axiosError.response.data);
        }
        throw JSON.stringify({ message: "An unexpected error occurred" });
    }
}

// Add a new function to get education level ID by section code and level code
export const getEducationLevelByCodeAndSection = async (
  sectionCode: string, 
  levelCode: string
): Promise<EducationLevel | null> => {
  try {
    const educationLevels = await getEducationLevels();
    const matchingLevel = educationLevels.find(level => {
      // Convert section ID to code if necessary
      // This depends on your data structure
      const sectionMatches = level.section.toString() === sectionCode;
      const levelMatches = level.code === levelCode;
      return sectionMatches && levelMatches;
    });
    
    return matchingLevel || null;
  } catch (error: unknown) {
    console.error("Failed to get education level:", error);
    return null;
  }
};

// endregion Education levels

// region Specialities

export const getSpecialities = async () => {
    try {
        const response = await api.get("/api/specialities/");
        return response.data as Speciality[];
    } catch (error: unknown) {
        const axiosError = error as AxiosError;
        if (axiosError.response?.data) {
            throw JSON.stringify(axiosError.response.data);
        }
        throw JSON.stringify({ message: "An unexpected error occurred" });
    }
}
export const getSpeciality = async (id: string) => {
    try {
        const response = await api.get(`/api/specialities/${id}`);
        return response.data as Speciality;
    }
    catch (error: unknown) {
        const axiosError = error as AxiosError;
        if (axiosError.response?.data) {
            throw JSON.stringify(axiosError.response.data);
        }
        throw JSON.stringify({ message: "An unexpected error occurred" });
    }
}

export const createSpeciality = async (speciality: Speciality) => {
    try {
        const response = await api.post("/api/specialities/", speciality);
        return response.data as Speciality;
    } catch (error: unknown) {
        const axiosError = error as AxiosError;
        if (axiosError.response?.data) {
            throw JSON.stringify(axiosError.response.data);
        }
        throw JSON.stringify({ message: "An unexpected error occurred" });
    }
}

export const updateSpeciality = async (speciality: Speciality) => {
    try {
        const response = await api.put(`/api/specialities/${speciality.id}`, speciality);
        return response.data as Speciality;
    } catch (error: unknown) {
        const axiosError = error as AxiosError;
        if (axiosError.response?.data) {
            throw JSON.stringify(axiosError.response.data);
        }
        throw JSON.stringify({ message: "An unexpected error occurred" });
    }
}

export const deleteSpeciality = async (id: string) => {
    try {
        const response = await api.delete(`/api/specialities/${id}`);
        return response.data as Speciality;
    } catch (error: unknown) {
        const axiosError = error as AxiosError;
        if (axiosError.response?.data) {
            throw JSON.stringify(axiosError.response.data);
        }
        throw JSON.stringify({ message: "An unexpected error occurred" });
    }
}
// endregion Specialities

// region Level classes

export const getLevelClasses = async () => {
    try {
        const response = await api.get("/api/class-definitions/");
        return response.data as LevelClassDefinition[];
    } catch (error: unknown) {
        const axiosError = error as AxiosError;
        if (axiosError.response?.data) {
            throw JSON.stringify(axiosError.response.data);
        }
        throw JSON.stringify({ message: "An unexpected error occurred" });
    }
}

export const getLevelClass = async (id: string) => {
    try {
        const response = await api.get(`/api/class-definitions/${id}`);
        return response.data as LevelClassDefinition;
    } catch (error: unknown) {
        const axiosError = error as AxiosError;
        if (axiosError.response?.data) {
            throw JSON.stringify(axiosError.response.data);
        }
        throw JSON.stringify({ message: "An unexpected error occurred" });
    }
}

export const createLevelClass = async (levelClass: LevelClassDefinition) => {
    try {
        const response = await api.post("/api/class-definitions/", levelClass);
        return response.data as LevelClassDefinition;
    } catch (error: unknown) {
        const axiosError = error as AxiosError;
        if (axiosError.response?.data) {
            throw JSON.stringify(axiosError.response.data);
        }
        throw JSON.stringify({ message: "An unexpected error occurred" });
    }
}

export const createLevelClassWithClasses = async (levelClass: LevelClassDefinitionCreate) => {
    try {
        const response = await api.post("/api/class-definitions/", levelClass);
        return response.data as LevelClassDefinition;
    } catch (error: unknown) {
        const axiosError = error as AxiosError;
        if (axiosError.response?.data) {
            throw JSON.stringify(axiosError.response.data);
        }
        throw JSON.stringify({ message: "An unexpected error occurred" });
    }
}

export const updateLevelClass = async (levelClass: LevelClassDefinition) => {
    try {
        const response = await api.put(`/api/class-definitions/${levelClass.id}/`, levelClass);
        return response.data as LevelClassDefinition;
    } catch (error: unknown) {
        const axiosError = error as AxiosError;
        if (axiosError.response?.data) {
            throw JSON.stringify(axiosError.response.data);
        }
        throw JSON.stringify({ message: "An unexpected error occurred" });
    }
}
export const deleteLevelClass = async (id: string) => {
    try {
        const response = await api.delete(`/api/class-definitions/${id}/`);
        return response.data as LevelClassDefinition;
    } catch (error: unknown) {
        const axiosError = error as AxiosError;
        if (axiosError.response?.data) {
            throw JSON.stringify(axiosError.response.data);
        }
        throw JSON.stringify({ message: "An unexpected error occurred" });
    }
}
// endregion Level classes

// region Class

export const getClasses = async () => {
    try {
        const response = await api.get("/api/classes/");
        return response.data as ClassType[];
    } catch (error: unknown) {
        const axiosError = error as AxiosError;
        if (axiosError.response?.data) {
            throw JSON.stringify(axiosError.response.data);
        }
        throw JSON.stringify({ message: "An unexpected error occurred" });
    }
}   

export const getClass = async (id: string) => {
    try {
        const response = await api.get(`/api/classes/${id}`);
        return response.data as ClassType;
    } catch (error: unknown) {
        const axiosError = error as AxiosError;
        if (axiosError.response?.data) {
            throw JSON.stringify(axiosError.response.data);
        }
        throw JSON.stringify({ message: "An unexpected error occurred" });
    }
}
export const createClass = async (classType: ClassType) => {
    try {
        const response = await api.post("/api/classes/", classType);
        return response.data as ClassType;
    } catch (error: unknown) {
        const axiosError = error as AxiosError;
        if (axiosError.response?.data) {
            throw JSON.stringify(axiosError.response.data);
        }
        throw JSON.stringify({ message: "An unexpected error occurred" });
    }
}

export const updateClass = async (classType: ClassType) => {
    try {
        const response = await api.put(`/api/classes/${classType.id}/`, classType);
        return response.data as ClassType;
    } catch (error: unknown) {
        const axiosError = error as AxiosError;
        if (axiosError.response?.data) {
            throw JSON.stringify(axiosError.response.data);
        }
        throw JSON.stringify({ message: "An unexpected error occurred" });
    }
}

export const deleteClass = async (id: string) => {
    try {
        const response = await api.delete(`/api/classes/${id}/`);
        return response.data as ClassType;
    } catch (error: unknown) {
        const axiosError = error as AxiosError;
        if (axiosError.response?.data) {
            throw JSON.stringify(axiosError.response.data);
        }
        throw JSON.stringify({ message: "An unexpected error occurred" });
    }
}
// endregion Class
