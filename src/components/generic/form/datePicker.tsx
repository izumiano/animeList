import { DesktopDatePicker as MuiDatePicker } from "@mui/x-date-pickers";
import dayjs from "dayjs";
import { useEffect, useRef, useState } from "react";
import type { MuiProps } from "./params";
import "./form.css";
import CalendarMonthIcon from "@mui/icons-material/CalendarMonth";
import ClearIcon from "@mui/icons-material/Clear";
import { Box, IconButton, InputAdornment, TextField } from "@mui/material";
import { formatDate, isValidDate } from "../../../utils/utils";

export default function DatePicker({
	id,
	label,
	defaultValue,
	format: dateFormat,
	fullWidth,
	onChange,
}: { format?: string } & MuiProps<Date | null>) {
	const [{ value }, setValueState] = useState<{ value: dayjs.Dayjs | null }>({
		value: defaultValue ? dayjs(defaultValue) : null,
	});
	const [valueOnOpen, setValueOnOpen] = useState<dayjs.Dayjs | null>(
		defaultValue ? dayjs(defaultValue) : null,
	);
	const accepted = useRef(false);

	const [isOpen, setIsOpenState] = useState(false);

	function setValue(newValue: dayjs.Dayjs | null) {
		setValueState({ value: newValue });

		let newDate = newValue?.toDate() ?? null;
		if (newDate && !isValidDate(newDate)) {
			newDate = null;
		}

		if (onChange && newDate?.getTime() !== value?.toDate().getTime()) {
			onChange(newDate);
		}
	}

	const containerRef = useRef<HTMLElement>(null);

	// const isDesktop = useMediaQuery("(pointer: fine)");

	useEffect(() => {
		setValueState({ value: defaultValue ? dayjs(defaultValue) : null });
	}, [defaultValue, id]);

	fullWidth ??= true;
	dateFormat ??= "dd mmm yyyy";

	return (
		<Box ref={containerRef}>
			<MuiDatePicker
				label={label}
				value={value}
				minDate={dayjs(new Date(0))}
				disableFuture
				closeOnSelect={false}
				open={isOpen}
				onChange={(value) => {
					setValue(value);
				}}
				onOpen={() => setIsOpenState(true)}
				onAccept={() => {
					accepted.current = true;
				}}
				onClose={() => {
					let newValueOnOpen = value;
					if (!accepted.current) {
						newValueOnOpen = valueOnOpen;
						setValue(newValueOnOpen);
					}
					setValueOnOpen(newValueOnOpen);
					setIsOpenState(false);
					accepted.current = false;
				}}
				slotProps={{
					popper: {
						anchorEl: containerRef.current,
					},
					desktopPaper: { className: "formCalendar" },
				}}
				slots={{
					field: () => {
						return (
							<TextField
								label={isOpen && value == null ? null : label}
								value={formatDate(
									value?.toDate(),
									dateFormat,
									isOpen ? label : "",
								)}
								focused={isOpen}
								fullWidth
								className="baseFormItem formTextField cursorPointer noCaret"
								onClick={() => {
									setIsOpenState(true);
								}}
								slotProps={{
									input: {
										endAdornment: (
											<InputAdornment
												position="end"
												className="MuiInputAdornment"
											>
												{value != null ? (
													<IconButton onClick={() => setValue(null)}>
														<ClearIcon />
													</IconButton>
												) : null}
												<IconButton>
													<CalendarMonthIcon />
												</IconButton>
											</InputAdornment>
										),
									},
								}}
							></TextField>
						);
					},
				}}
				className="baseFormItem formDatePicker"
			/>
		</Box>
	);
}
