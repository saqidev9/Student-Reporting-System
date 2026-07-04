const BASE_URL = "http://localhost:3000/api/program";

export async function getCourses() {
  const token = localStorage.getItem("toke");
  const response = await fetch(`${BASE_URL}/courses`, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${localStorage.getItem("token")}`,
    },
  });

  if (!response.ok) {
    throw new Error("Failed to fetch courses");
  }

  const result = await response.json();

  return result.data.courses;
}

export async function createCourse(payload) {
  const token = localStorage.getItem("toke");
  const response = await fetch(`${BASE_URL}/courses`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${localStorage.getItem("token")}`,
    },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    throw new Error("Failed to create course");
  }

  return response.json();
}
