 import { useState, useEffect } from "react";
 import Head from "next/head";
 import { useRouter } from "next/router";
 import { Alert, Button, CircularProgress, Container, Dialog, DialogContent, DialogActions, Divider, IconButton, Snackbar, Stack, Typography } from "@mui/material";
 import AddIcon from "@mui/icons-material/Add";
 import NavBar from "../components/navbar";
 import EntryRow from "../components/entryRow";
 import ExpenseDialog from "../components/expenseDialog";
 import { useAuth } from "../firebase/auth";
 import styles from "../styles/dashboard.module.scss";
 import { getRecentEntries, deleteEntry } from "../firebase/entries"

const ADD_SUCCESS = "Entry was successfully added!";
const ADD_ERROR = "Entry was not successfully added!";
const EDIT_SUCCESS = "Entry was successfully updated!";
const EDIT_ERROR = "Entry was not successfully updated!";
const DELETE_SUCCESS = "Entry successfully deleted!";
const DELETE_ERROR = "Entry not successfully deleted!";

// Enum to represent different states of entries
export const ENTRY_ENUM = Object.freeze({
  none: 0,
  add: 1,
  edit: 2,
  delete: 3,
});

const SUCCESS_MAP = {
  [ENTRY_ENUM.add]: ADD_SUCCESS,
  [ENTRY_ENUM.edit]: EDIT_SUCCESS,
  [ENTRY_ENUM.delete]: DELETE_SUCCESS
}

const ERROR_MAP = {
  [ENTRY_ENUM.add]: ADD_ERROR,
  [ENTRY_ENUM.edit]: EDIT_ERROR,
  [ENTRY_ENUM.delete]: DELETE_ERROR
}

export default function Dashboard() {
  const { authUser, isLoading } = useAuth();
  const router = useRouter();
  const [action, setAction] = useState(ENTRY_ENUM.none);
  const [entries, setEntries] = useState([]);
  // State involved in loading, setting, deleting, and updating entries
  const [deleteEntryId, setDeleteEntryId] = useState("");
  const [updateEntry, setUpdateEntry] = useState({});

  // State involved in snackbar
  const [snackbarMessage, setSnackbarMessage] = useState("");
  const [showSuccessSnackbar, setSuccessSnackbar] = useState(false);
  const [showErrorSnackbar, setErrorSnackbar] = useState(false);

  // Sets appropriate snackbar message on whether @isSuccess and updates shown entries if necessary
  const onResult = async (entryEnum, isSuccess) => {
    setSnackbarMessage(isSuccess ? SUCCESS_MAP[entryEnum] : ERROR_MAP[entryEnum]);
    isSuccess ? setSuccessSnackbar(true) : setErrorSnackbar(true);
    setAction(ENTRY_ENUM.none);
  }

  // Listen to changes for loading and authUser, redirect if needed
  useEffect(() => {
    if (!isLoading && !authUser) {
      router.push("/");
    }
  }, [authUser, isLoading]);

  useEffect(async () => {
    if (authUser) {
      const unsubscribe = await getRecentEntries(authUser.uid, setEntries);
      return () => unsubscribe();
    }
  }, [authUser])

  // For all of the onClick functions, update the action and fields for updating

  const onClickAdd = () => {
    setAction(ENTRY_ENUM.add);
    setUpdateEntry({});
  }

  const onUpdate = (entry) => {
    setAction(ENTRY_ENUM.edit);
    setUpdateEntry(entry);
  }

  const onClickDelete = (id) => {
    setAction(ENTRY_ENUM.delete);
    setDeleteEntryId(id);
  }

  const resetDelete = () => {
    setAction(ENTRY_ENUM.none);
    setDeleteEntryId("");
  }

  const onDelete = async () => {
    let isSucceed = true;
    try {
      await deleteEntry(authUser.uid, deleteEntryId);
    } catch (error) {
      isSucceed = false;
    }
    resetDelete();
    onResult(ENTRY_ENUM.delete, isSucceed);
  }

  return ((!authUser) ?
  <CircularProgress color="inherit" sx={{ marginLeft: "50%", marginTop: "25%" }}/>
  :
    <div>
      <Head>
        <title>Mum&apos;s Diary</title>
      </Head>

      <NavBar />
      <Container>
        <Snackbar open={showSuccessSnackbar} autoHideDuration={1500} onClose={() => setSuccessSnackbar(false)}
                  anchorOrigin={{ horizontal: "center", vertical: "top" }}>
          <Alert onClose={() => setSuccessSnackbar(false)} severity="success">{snackbarMessage}</Alert>
        </Snackbar>
        <Snackbar open={showErrorSnackbar} autoHideDuration={1500} onClose={() => setErrorSnackbar(false)}
                  anchorOrigin={{ horizontal: "center", vertical: "top" }}>
          <Alert onClose={() => setErrorSnackbar(false)} severity="error">{snackbarMessage}</Alert>
        </Snackbar>
        <Stack direction="row" sx={{ paddingTop: "1.5em" }}>
          <Typography variant="h4" sx={{ lineHeight: 2, paddingRight: "0.5em" }}>
            EXPENSES
          </Typography>
          <IconButton aria-label="edit" color="secondary" onClick={onClickAdd} className={styles.addButton}>
            <AddIcon />
          </IconButton>
        </Stack>
        { entries.map((entry) => (
          <div key={entry.id}>
            <Divider light />
            <EntryRow entry={entry}
                        onEdit={() => onUpdate(entry)}
                        onDelete={() => onClickDelete(entry.id)} />
          </div>)
        )}
      </Container>
      <ExpenseDialog edit={updateEntry}
                     showDialog={action === ENTRY_ENUM.add || action === ENTRY_ENUM.edit}
                     onError={(entryEnum) => onResult(entryEnum, false)}
                     onSuccess={(entryEnum) => onResult(entryEnum, true)}
                     onCloseDialog={() => setAction(ENTRY_ENUM.none)}>
      </ExpenseDialog>
      <Dialog open={action === ENTRY_ENUM.delete} onClose={resetDelete}>
        <Typography variant="h4" className={styles.title}>DELETE ENTRY</Typography>
        <DialogContent>
            <Alert severity="error">This will permanently delete your entry!</Alert>
        </DialogContent>
        <DialogActions sx={{ padding: "0 24px 24px"}}>
          <Button color="secondary" variant="outlined" onClick={resetDelete}>
              Cancel
          </Button>
          <Button color="secondary" variant="contained" onClick={onDelete} autoFocus>
              Delete
          </Button>
        </DialogActions>
      </Dialog>
    </div>
  )
}