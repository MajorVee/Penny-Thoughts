import { useState, useEffect } from "react";
import {
  Authenticator,
  Button,
  Text,
  TextField,
  Heading,
  Flex,
  View,
  Image,
  Divider,
  Modal,
} from "@aws-amplify/ui-react";
import { Amplify } from "aws-amplify";
import "@aws-amplify/ui-react/styles.css";
import { getUrl } from "aws-amplify/storage";
import { uploadData } from "aws-amplify/storage";
import { generateClient } from "aws-amplify/data";
import outputs from "../amplify_outputs.json";
/**
 * @type {import('aws-amplify/data').Client<import('../amplify/data/resource').Schema>}
 */

Amplify.configure(outputs);
const client = generateClient({
  authMode: "userPool",
});

export default function App() {
  const [notes, setNotes] = useState([]);
  const [selectedNote, setSelectedNote] = useState(null); // For modal
  const [isModalOpen, setIsModalOpen] = useState(false); // Modal control

  useEffect(() => {
    fetchNotes();
  }, []);

  async function fetchNotes() {
    const { data: notes } = await client.models.Note.list();
    await Promise.all(
      notes.map(async (note) => {
        if (note.image) {
          const linkToStorageFile = await getUrl({
            path: ({ identityId }) => `media/${identityId}/${note.image}`,
          });
          note.image = linkToStorageFile.url;
        }
        return note;
      })
    );
    setNotes(notes);
  }

  async function createNote(event) {
    event.preventDefault();
    const form = new FormData(event.target);

    const { data: newNote } = await client.models.Note.create({
      name: form.get("name"),
      description: form.get("description"),
      image: form.get("image").name,
    });

    if (newNote.image)
      await uploadData({
        path: ({ identityId }) => `media/${identityId}/${newNote.image}`,
        data: form.get("image"),
      }).result;

    fetchNotes();
    event.target.reset();
  }

  async function deleteNote({ id }) {
    const toBeDeletedNote = { id: id };

    const { data: deletedNote } = await client.models.Note.delete(
      toBeDeletedNote
    );
    fetchNotes();
  }

  function openModal(note) {
    setSelectedNote(note);
    setIsModalOpen(true);
  }

  function closeModal() {
    setIsModalOpen(false);
    setSelectedNote(null);
  }

  async function updateNote(event) {
    event.preventDefault();
    const form = new FormData(event.target);

    await client.models.Note.update({
      id: selectedNote.id,
      name: form.get("name"),
      description: form.get("description"),
      image: selectedNote.image, // Keep the image the same
    });

    fetchNotes();
    closeModal();
  }

  return (
    <Authenticator>
      {({ signOut }) => (
        <Flex
          className="App"
          justifyContent="center"
          alignItems="center"
          direction="column"
          width="70%"
          margin="0 auto"
        >
          <Heading
            level={1}
            style={{
              textAlign: "center",
              fontWeight: "bold",
              fontSize: "2.5rem",
              color: "#333",
              marginBottom: "1.5rem",
            }}
          >
            Penny Thoughts
          </Heading>

          <View
            as="form"
            style={{
              maxWidth: "600px",
              margin: "2rem auto",
              padding: "2rem",
              backgroundColor: "#f9f9f9",
              borderRadius: "12px",
              boxShadow: "0px 4px 12px rgba(0, 0, 0, 0.1)",
            }}
            onSubmit={createNote}
          >
            <Flex direction="column" justifyContent="center" gap="1.5rem">
              <TextField
                name="name"
                placeholder="Thought Title"
                label="Note Name"
                labelHidden
                variation="quiet"
                required
                style={{
                  fontSize: "1rem",
                  padding: "10px",
                  borderRadius: "8px",
                  border: "1px solid #ccc",
                }}
              />

              <textarea
                name="description"
                placeholder="What's on your mind?"
                required
                style={{
                  fontSize: "1rem",
                  padding: "10px",
                  borderRadius: "8px",
                  border: "1px solid #ccc",
                  resize: "both", // This allows the description to be resizable
                }}
              />

              <View
                name="image"
                as="input"
                type="file"
                alignSelf="end"
                accept="image/png, image/jpeg"
                style={{
                  fontSize: "0.9rem",
                  padding: "8px",
                  margin: "1rem 0",
                  cursor: "pointer",
                  color: "#555",
                }}
              />

              <Button
                type="submit"
                variation="primary"
                style={{
                  padding: "12px 20px",
                  backgroundColor: "#007bff",
                  borderRadius: "8px",
                  fontSize: "1.1rem",
                  fontWeight: "bold",
                  color: "#fff",
                  border: "none",
                  cursor: "pointer",
                }}
              >
                Penny!
              </Button>
            </Flex>
          </View>

          <Divider />
          <Heading level={2}>Published Thoughts</Heading>
          <Flex
            direction="column" // Stack notes vertically
            justifyContent="center"
            gap="2rem"
            width="100%" // Full width for the timeline feel
            alignItems="center"
          >
            {notes.map((note) => (
              <Flex
                key={note.id || note.name}
                direction="column"
                justifyContent="center"
                alignItems="center"
                gap="1.5rem"
                padding="2rem"
                borderRadius="10px" // Smoother rounded corners
                backgroundColor="#f0f0f5" // Soft background color
                boxShadow="0px 4px 12px rgba(0, 0, 0, 0.1)" // Soft shadow for depth
                style={{
                  border: "none", // Remove border for a cleaner look
                  maxWidth: "400px", // Restrict the width for better visual alignment
                  width: "100%",
                }}
                className="box"
              >
                <View>
                  <Heading level="3">{note.name}</Heading>
                </View>
                <Text fontStyle="italic">{note.description}</Text>
                {note.image && (
                  <Image
                    src={note.image}
                    alt={`visual aid for ${note.name}`}
                    style={{ width: "100%", borderRadius: "8px" }}
                  />
                )}
                <Flex direction="row" justifyContent="space-between" width="100%">
                  <Button
                    onClick={() => openModal(note)} // Open the modal for editing
                    style={{ width: "48%", backgroundColor: "#28a745", color: "#fff" }}
                  >
                    Edit Note
                  </Button>
                  <Button
                    variation="destructive"
                    onClick={() => deleteNote(note)}
                    style={{ width: "48%", backgroundColor: "#dc3545", color: "#fff" }} // Delete button color
                  >
                    Delete Note
                  </Button>
                </Flex>
              </Flex>
            ))}
          </Flex>

          {/* Modal for viewing and editing note */}
          {isModalOpen && (
            <Modal
              onClose={closeModal}
              isOpen={isModalOpen}
              title="Edit Note"
              style={{
                padding: "2rem",
                maxWidth: "600px",
                margin: "auto",
                backgroundColor: "#fff",
                borderRadius: "10px",
                boxShadow: "0px 4px 12px rgba(0, 0, 0, 0.2)",
              }}
            >
              <form onSubmit={updateNote}>
                <TextField
                  name="name"
                  defaultValue={selectedNote.name}
                  label="Note Name"
                  required
                  style={{ marginBottom: "1rem" }}
                />
                <textarea
                  name="description"
                  defaultValue={selectedNote.description}
                  required
                  style={{
                    width: "100%",
                    padding: "10px",
                    borderRadius: "8px",
                    border: "1px solid #ccc",
                    marginBottom: "1rem",
                  }}
                />
                <Button type="submit" style={{ backgroundColor: "#007bff", color: "#fff" }}>
                  Save Changes
                </Button>
              </form>
            </Modal>
          )}

          <Button onClick={signOut}>Sign Out</Button>
        </Flex>
      )}
    </Authenticator>
  );
}
