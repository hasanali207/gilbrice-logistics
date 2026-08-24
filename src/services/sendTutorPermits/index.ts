export const sendTutorPermit = async (
  tutorId: string,
  userEmail: string,
  price: number
) => {
  try {
    const response = await fetch(`${process.env.NEXT_PUBLIC_BASE_API}/api/permits/create`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        tutorId,
        userEmail,
        price,
      }),
    });

    const data = await response.json();

    return {
      success: true,
      message: data.message || "Permit sent successfully!",
    };
  } catch (error) {
    console.error("Error sending request:", error);
    return { success: false };
  }
};

export const getAllPermits = async () => {
  try {
    const res = await fetch(`${process.env.NEXT_PUBLIC_BASE_API}/api/permits`, {
      next: {
        tags: ["REQUESTS"], //modify this to match your cache key
      },
    });
    const data = await res.json();
    return data;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
  } catch (error: any) {
    return Error(error.message);
  }
};

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const updatePermit = async (requestId: string, updateData: any) => {
  try {
    const response = await fetch(
      `${process.env.NEXT_PUBLIC_BASE_API}/api/permits/${requestId}`,
      {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(updateData), // The update data, like status, comments, etc.
      }
    );

    const data = await response.json();

    if (response.ok) {
      return {
        success: true,
        message: data.message || "Request updated successfully!",
      };
    } else {
      return {
        success: false,
        message: data.message || "Failed to update request.",
      };
    }
  } catch (error) {
    console.error("Error updating request:", error);
    return {
      success: false,
      message: "An error occurred while updating the request.",
    };
  }
};
