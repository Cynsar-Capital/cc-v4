import { CheckCircledIcon } from "@radix-ui/react-icons";
import React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import clsx from "clsx";

import { Heading } from "@/common/heading";
import { Section } from "@/common/layout";
import { ButtonLink } from "@/common/button";
import { type fragmentOn, isBooleanComponent, isCustomTextComponent } from ".basehub/schema";

import { MobilePricingComparation } from "./mobile-pricing-comparition";
import { type planFragment, type pricingTableFragment, type valueFragment } from "./fragments";

export type PricingTableProps = fragmentOn.infer<typeof pricingTableFragment>;

export function PricingTable({ heading, categories }: PricingTableProps) {
  const plans = extractPlans(categories);

  return (
    <Section className="xl:max-w-screen-xl" id="pricing">
      <Heading {...heading}>
        <h4>{heading.title}</h4>
      </Heading>
      <table className="hidden w-full table-fixed lg:table">
        <thead>
          <tr>
            <PlanHeader plan={null} />
            {plans.map((plan) => (
              <PlanHeader key={plan._id} plan={plan} />
            ))}
          </tr>
        </thead>
        <tbody>
          {categories.items.map((category, i) => (
            <React.Fragment key={category._id}>
              <CategoryHeader category={category} className={clsx(i === 0 && "py-4")} />
              {category.features.items.map((feature) => (
                <tr key={feature._id}>
                  <th className="w-auto">
                    <TableCell align="start" as="div" className="w-" type="primary">
                      <p>{feature._title}</p>
                    </TableCell>
                  </th>
                  {feature.values.items.map((value) => (
                    <FeatureValue key={value._id} value={value} />
                  ))}
                </tr>
              ))}
            </React.Fragment>
          ))}
        </tbody>
      </table>
      <MobilePricingComparation {...{ categories, plans }} />
    </Section>
  );
}

/* -------------------------------------------------------------------------- */
/*                                 Components                                 */
/* -------------------------------------------------------------------------- */

/* ------------------------------- Table cell ------------------------------- */
const $tableCell = cva("min-h-16 px-3 text-base flex items-center gap-1.5 font-normal", {
  variants: {
    align: {
      start: "text-start justify-start",
      center: "text-center justify-center",
      end: "text-end justify-end",
    },
    type: {
      default: "text-text-secondary dark:text-dark-text-secondary",
      primary: "text-primary dark:text-dark-primary",
    },
  },
  defaultVariants: {
    align: "center",
    type: "default",
  },
});

interface TableCellProps<T extends React.ElementType> {
  as?: T;
  className?: string;
  children: React.ReactNode;
}

function TableCell<T extends React.ElementType = "td">({
  as,
  className,
  children,
  align,
  type,
  ...props
}: TableCellProps<T> &
  React.ComponentPropsWithoutRef<T> &
  VariantProps<typeof $tableCell>): JSX.Element {
  const Component = as ?? "div";

  return (
    <Component className={$tableCell({ class: className, type, align })} {...props}>
      {children}
    </Component>
  );
}

/* ------------------------------ Category header ---------------------------- */

function CategoryHeader({
  category,
  className,
}: {
  category: PricingTableProps["categories"]["items"][0];
  className?: string;
}) {
  return (
    <tr>
      <th className="w-auto">
        <TableCell
          align="start"
          as="div"
          className={clsx("px-3 pb-2 pt-10", className)}
          type="primary"
        >
          <p className="text-lg font-medium">{category._title}</p>
        </TableCell>
      </th>
      {Array.from(category.features.items[0].values.items).map((_) => (
        <th key={`${category._title}${_._id}`} className="w-[1fr]" />
      ))}
    </tr>
  );
}

type ValueFragment = fragmentOn.infer<typeof valueFragment>;

function PlanHeader({ plan }: { plan: ValueFragment["plan"] | null }) {
  return plan ? (
    <th className="w-[1fr]">
      <span className="flex flex-col items-center gap-3 font-normal">
        <div className="flex flex-col items-center gap-0.5">
          <p className="text-base text-text-secondary dark:text-dark-text-secondary md:text-base">
            {plan._title}
          </p>
          <p className="text-lg font-medium">{plan.price}</p>
        </div>
        <ButtonLink href="#" intent={plan.isMostPopular ? "primary" : "secondary"}>
          Get started
        </ButtonLink>
      </span>
    </th>
  ) : (
    <th className="w-auto" />
  );
}

function FeatureValue({ value }: { value?: ValueFragment }) {
  return (
    <td className="w-[1fr]">
      <TableCell>
        {value ? (
          isBooleanComponent(value.value) ? (
            value.value.boolean ? (
              <span className="bg-success/10 flex items-center justify-center rounded-full p-1.5">
                <CheckCircledIcon className="text-success size-5" />
              </span>
            ) : (
              <span className="text-xl text-text-tertiary/50 dark:text-dark-text-tertiary/50 ">
                &mdash;
              </span>
            )
          ) : isCustomTextComponent(value.value) ? (
            <p>{value.value.text}</p>
          ) : null
        ) : null}
      </TableCell>
    </td>
  );
}

/* -------------------------------------------------------------------------- */
/*                                    Utils                                   */
/* -------------------------------------------------------------------------- */

export type PlanFragment = fragmentOn.infer<typeof planFragment>;

const extractPlans = (categories: PricingTableProps["categories"]) => {
  const plans = new Map<string, PlanFragment>();

  categories.items.forEach((category) => {
    category.features.items.forEach((feature) => {
      feature.values.items.forEach((value) => {
        plans.set(value.plan._title, value.plan);
      });
    });
  });

  return Array.from(plans.values());
};