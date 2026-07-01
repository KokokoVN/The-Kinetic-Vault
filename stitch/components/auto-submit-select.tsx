"use client";

import React from "react";

export function AutoSubmitSelect(props: React.SelectHTMLAttributes<HTMLSelectElement>) {
  return (
    <select
      {...props}
      onChange={(e) => {
        props.onChange?.(e);
        e.target.form?.requestSubmit();
      }}
    />
  );
}
