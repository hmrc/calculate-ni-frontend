# calculate-ni-frontend

# Table of Contents

* [Class 1 contributions](#class-1-contributions)
* [Directors](#directors)
* [Unofficial Deferment](#unofficial-deferment)
* [Licence](#license)

## Class 1 contributions

Class contributions are split between **primary** contributions which are payable by employees and **secondary** 
contributions  which are payable by employers. The amount of contributions depends on how much the employee earns. In general,
an employee's earnings in their earnings period (e.g. monthly or weekly) are divided across different bands and contributions 
are calculated as a set percentage (rate) of the amount of earnings within each band. Each band has its own primary and 
secondary rate which depend on an individual's circumstances which is captured in a person's category letter. The band limits generally change
each tax year. 

Comprehensive documentation about Class 1 NICs can be found under the public HMRC internal manuals 
[here](https://www.gov.uk/hmrc-internal-manuals/national-insurance-manual/nim01000co).

Additional information can also be found in the CGW2 booklets published by HMRC and the
[National Insurance Guidance for software developers](https://www.gov.uk/government/publications/payroll-technical-specifications-national-insurance).


## Directors

The directors calculator calculates class 1 NICs for directors. The calculation largely follows the same rules for calculating
non-directors class 1 NICs except that earnings period is different. For directors, the earnings period is either annual 
or pro-rata annual.

The calculator allows multiple income sources to be input for a director's annual earnings period. Earnings under different
category letters follow an order of precedence. For example, if a director had earnings under both category `A` abd `M`, 
then the  earnings under category `M` would have priority over earnings under category `A`. This means that NICs due for earnings 
under `M` are calculated first and then NIC's under category `A` are calculated where the earnings under `A` are taken  
to be above those under `M`. This is illustrated in this example:

<details>
<summary>Example - precedence of categories</summary>

```
Let us take these band limits:
  • LEL = £100
  • ET  = £150
  • UEL = £1000

This means that the maximum amounts in each band are:
+------------------------+
| band      | max amount |
|-----------|------------|
| below LEL | £100       |
| LEL - ET  | £50        |
| ET - UEL  | £850       |
| over UEL  | -          |
+------------------------+ 
 
Let us assume that a director has these earnings:

Earnings under category 'A' = £3000
Earnings under category 'M' = £175

We can calculate NICs whilst taking order of precendence into account thus:

Step 1)
Earnings under category 'M' have priority over earnings under category 'A'. Consider the £175 
earnings under cateogry 'M'. Earnings are distributed across the bands like so:

+--------------------+
| band      | amount |
|-----------|--------|
| below LEL | £100   |
| LEL - ET  | £50    |
| ET - UEL  | £25    |
| over UEL  | £0     |
+--------------------+ 

NICs are calculated according to the distribution above.

Step 2)
Consider the £3000 earnings under category 'A'. Earnings are distributed across the bands like so:

+--------------------+
| band      | amount |
|-----------|--------|
| below LEL | £0     |
| LEL - ET  | £0     |
| ET - UEL  | £825   |
| over UEL  | £2175  |
+--------------------+ 

The earnings are taken on top of the £175 earnings under category `M`. The earnings under `M` 
got up to contributing £25 to the `ET - UEL` band.
  
NICs are calculated according to the distribution above.

Step 3)
Total NICs due are the NICs due under category `M` added to the NICs due under category `A`.
```
</details>

The order of precedence changes for historical years depending on whether directors had an Appropriate Personal Pension 
or Appropriate Personal Pension Stakeholder Pension (APP). These schemes were abolished from 6th April 2012.


In-depth details about how NICs are calculated for directors can be found in the CA44 booklets published by HMRC.

## Unofficial Deferment
Before 6th April 2003, there was a maximum limit of class 1 NICs a person could be liable for. From 6th April 2003, changes 
were introduced which meant that this annual maximum was removed. All earnings in excess of the Upper Earning Limit 
(UEL) contribute to class 1 NICs liability. The removal of the annual maximum applied to people with one employment. For 
people with more than one employment, an annual maximum was retained. However, the annual maximum did not remain a static 
figure which applied to everyone. Instead, rules were laid out to calculate a person's specific annual maximum. This calculation 
is described in page `NIM01163` of the HMRC National Insurance Manual.

Under certain circumstances, a person can elect to defer paying class 1 NICs. In general, a person is eligible to defer 
payment of class 1 NICs in a specific tax year if they have more than one employment, and they expect to earn a high 
amount in that tax year. The deferment process allows a person's class 1 NICs liability and annual maximum to be retroactively 
calculated after the end of the tax year. After that calculation is made, the person is either liable to pay more class 
1 NICs if they have not paid enough class 1 NICs, or the person is due a refund if they have paid more than their annual 
maximum. The deferment process aims to prevent employees paying too much NICs and to thus prevent refunds.

Applications to defer class 1 NICs are submitted to HRMC and are due on 14th February in the tax year before deferment 
is desired. If deferment is granted, a deferment certificate is issued. There are some employers who defer class 1 NICs
without authority from Deferment Services in HMRC. This is known as unofficial deferment. 



### License
 
This code is open source software licensed under the [Apache 2.0 License]("http://www.apache.org/licenses/LICENSE-2.0.html").
