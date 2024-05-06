import { IconButton, Stack, Typography } from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import EditIcon from '@mui/icons-material/Edit';
import { format } from 'date-fns';
import styles from '../styles/receiptRow.module.scss';

/* 
Each row with entry information

props: entry data
 - id (doc id of receipt)
 - date
 - category
 - subcategory
 - amount
 - colour

 - onEdit emits to notify needing to update entry
 - onDelete emits to notify needing to delete entry
 */
export default function EntryRow(props) {
    const entry = props.entry;
    return (
        <div>
            <Stack direction="row" justifyContent="space-between" sx={{ margin: "1em 0" }}>
                <Stack direction="row" spacing={2} sx={{ alignItems: "center" }}>
                    <Stack direction="row" className={styles.contentRow}>
                        <Stack direction="column" sx={{ flexGrow: 1 }}>
                            <Typography variant="h3">
                                {format(entry.date, 'dd/MM/yyyy')}
                            </Typography> 
                            <Typography variant="h4">
                                ${entry.amount}
                            </Typography>
                        </Stack>
                        <Stack direction="column" sx={{ flexGrow: 1 }}>
                            <Typography variant="h5">
                                {entry.category}
                            </Typography>
                            <Typography variant="h7">
                                {entry.subCategory}
                            </Typography>                
                        </Stack>
                    </Stack>
                </Stack>
                <Stack direction="row" className={styles.actions}>
                    <IconButton aria-label="edit" color="secondary" onClick={props.onEdit}>
                        <EditIcon />
                    </IconButton>
                    <IconButton aria-label="delete" color="secondary" onClick={props.onDelete}>
                        <DeleteIcon />
                    </IconButton>
                </Stack>
            </Stack>
        </div>
    )
}