import AllStaff from "@/components/Staff/AllStaff";

// "Add Staff" is handled as a modal from the AllStaff list page
// (the "Add Staff" button in the header opens CreateStaffModal).
// This route renders the same list page so the sidebar link works
// and the modal can be opened directly from here as well.

function page() {
  return (
    <div>
      <AllStaff />
    </div>
  );
}

export default page;
