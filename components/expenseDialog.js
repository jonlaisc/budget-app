import { useState, useEffect } from "react";
import { Avatar, Button, Dialog, DialogActions, DialogContent, Stack, TextField, Typography } from "@mui/material";
import AdapterDateFns from "@mui/lab/AdapterDateFns";
import DatePicker from "@mui/lab/DatePicker";
import LocalizationProvider from "@mui/lab/LocalizationProvider";
import { useAuth } from "../firebase/auth";
import { addEntry, editEntry } from "../firebase/entries";
import { getAllExpensesCategories, getAllIncomesCategories } from "../firebase/categories";
import styles from "../styles/expenseDialog.module.scss";
import { EXPENSES, INCOMES } from "../firebase/entries";
import { ENTRY_ENUM } from "../pages/dashboard"

// Default form state for the dialog
const DEFAULT_FORM_STATE = {
  category: "",
  subCategory: "",
  date: new Date(),
  amount: "",
};

/* 
 Dialog to input entry information
 
 props:
  - edit is the entry to edit
  - showDialog boolean for whether to show this dialog
  - onError emits to notify error occurred
  - onSuccess emits to notify successfully saving entry
  - onCloseDialog emits to close dialog
 */
export default function ExpenseDialog(props) {
  const  { authUser } = useAuth();
  const isEdit = Object.keys(props.edit).length > 0;
  const [formFields, setFormFields] = useState(isEdit ? props.edit : DEFAULT_FORM_STATE);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState(formFields.category);
  const [expenseCategories, setExpenseCategories] = useState([]);
  const [incomeCategories, setIncomeCategories] = useState([]);
  const [entryType, setEntryType] = useState(""); 

  // If the receipt to edit or whether to close or open the dialog ever changes, reset the form fields
  useEffect(() => {
    if (props.showDialog) {
      setFormFields(isEdit ? props.edit : DEFAULT_FORM_STATE);
      setSelectedCategory("");
      setEntryType(EXPENSES);
      async function fetchCategories() {
        const expenseCategories = await getAllExpensesCategories(authUser.uid);
        const incomeCategories = await getAllIncomesCategories(authUser.uid);
        setExpenseCategories(expenseCategories);
        setIncomeCategories(incomeCategories);
      }
      fetchCategories();
    }
    
  }, [props.edit, props.showDialog])

  // Check whether any of the form fields are unedited
  const isDisabled = () => !formFields.date || formFields.category.length === 0 
                     || formFields.subCategory.length === 0 || formFields.amount <= 0;

  // Update given field in the form
  const updateFormField = (event, field) => {
    setFormFields(prevState => ({...prevState, [field]: event.target.value}))
  }

  const closeDialog = () => {
    setIsSubmitting(false);
    props.onCloseDialog();
  }

  const handleCategorySelection = (category, type) => {
    setSelectedCategory(category);
    setEntryType(type);
    // Update the form field as well if needed
    setFormFields(prevState => ({...prevState, category: category}));
  };

  const handleSubmit = async () => {
    setIsSubmitting(true);

    try {
      if (isEdit) {
        await editEntry(authUser.uid, formFields.id, formFields.entryType, formFields.category, formFields.subCategory, formFields.date, parseFloat(parseFloat(formFields.amount).toFixed(2)));
      } else {
        await addEntry(authUser.uid, entryType, formFields.category, formFields.subCategory, formFields.date, parseFloat(parseFloat(formFields.amount).toFixed(2)));
      }

      props.onSuccess(isEdit ? ENTRY_ENUM.edit : ENTRY_ENUM.add);
    } catch (error) {
      props.onError(isEdit ? ENTRY_ENUM.edit : ENTRY_ENUM.add);
    }

    closeDialog();
  }

  const renderCategories = (categories, type) => {
    return (
      <div>
        <Typography variant="h6" className={styles.categoryTitle}>
          {type}
        </Typography>
        <div className={styles.categoryTiles}>
          {categories.map((category, index) => (
            <div
              key={index}
              className={`${styles.categoryTile} ${selectedCategory === category.name ? styles.selectedCategory : ''}`}
              onClick={() => handleCategorySelection(category.name, type)}
            >
              {category.name}
            </div>
          ))}
        </div>
      </div>
    );
  };

  return (
    <Dialog classes={{paper: styles.dialog}}
      onClose={() => closeDialog()}
      open={props.showDialog}
      component="form">
      <Typography variant="h4" className={styles.title}>
        {isEdit ? "EDIT" : "ADD"} EXPENSE
      </Typography>
      <DialogContent className={styles.fields}>
        <Stack>
          <LocalizationProvider dateAdapter={AdapterDateFns}>
          <DatePicker
              label="Date"
              value={formFields.date}
              onChange={(newDate) => {
                setFormFields(prevState => ({...prevState, date: newDate}));
              }}
              maxDate={new Date()}
              renderInput={(params) => <TextField color="tertiary" {...params} />}
            />
          </LocalizationProvider>
        </Stack>
        {renderCategories(expenseCategories, EXPENSES)}
        {renderCategories(incomeCategories, INCOMES)}
        <TextField color="tertiary" label="Sub-Category" variant="standard" value={formFields.subCategory} onChange={(event) => updateFormField(event, "subCategory")} />
        <TextField color="tertiary" label="Amount" variant="standard" type="number" value={formFields.amount} onChange={(event) => updateFormField(event, "amount")} />
      </DialogContent>
      <DialogActions>
        {isSubmitting ? 
          <Button color="secondary" variant="contained" disabled={true}>
            Submitting...
          </Button> :
          <Button color="secondary" variant="contained" onClick={handleSubmit} disabled={isDisabled()}>
            Submit
          </Button>}
      </DialogActions>
    </Dialog>
  )
}