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
                <Button
  onClick={() => deleteNote(note)}
  style={{
    background: "linear-gradient(135deg, #ff6b6b, #f06595)", // Gradient background
    color: "#fff",
    border: "none",
    borderRadius: "12px", // Rounded corners
    padding: "12px 20px",
    fontSize: "1rem",
    fontWeight: "bold",
    cursor: "pointer",
    boxShadow: "0px 4px 10px rgba(0, 0, 0, 0.2)", // Soft shadow
    transition: "background 0.3s ease, transform 0.2s ease", // Smooth transition
    width: "auto", // Adjust width to fit content
    minWidth: "150px", // Minimum width to ensure the button doesn’t become too narrow
    textAlign: "center" // Center text inside button
  }}
  onMouseOver={(e) => {
    e.currentTarget.style.background = "linear-gradient(135deg, #ff5252, #e83e8c)"; // Darker gradient on hover
    e.currentTarget.style.transform = "scale(1.02)"; // Slightly enlarge on hover
  }}
  onMouseOut={(e) => {
    e.currentTarget.style.background = "linear-gradient(135deg, #ff6b6b, #f06595)"; // Revert gradient on mouse out
    e.currentTarget.style.transform = "scale(1)"; // Revert scale
  }}
>
  Delete
</Button>

              </Flex>
            ))}
          </Flex>
          <Button onClick={signOut}>Sign Out</Button>
        </Flex>
      )}
    </Authenticator>
  );
}
